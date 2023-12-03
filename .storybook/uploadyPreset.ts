import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import pacote from "pacote";
import { getMatchingPackages } from "../scripts/lernaUtils.mjs";
import { getUploadyVersion } from "../scripts/uploadyVersion.mjs";
import path from "path";

const getCurrentNpmVersion = async (pkg) => {
    let result = null;

    try {
        let version = pkg.get("version");

        if (process.env.CI) {
            //for CI - publishing to production - get latest from npm
            console.log(`retrieving version for ${pkg.name} from npm repository`);
            const pkgManifest = await pacote.manifest(pkg.name);
            console.log(`retrieved version for ${pkg.name} from npm repository: ${pkgManifest.version}`);
            version = pkgManifest.version;
        }

        result = { name: pkg.name, version };
    } catch (e) {
        console.error("FAILED TO GET NPM VERSION !!!!!", e);
    }

    return result;
};

const getAllPackagesVersions = async () => {
    const pkgs = getMatchingPackages();

    console.log("...Retrieving package versions for stories");

    const pkgVersions = await Promise.all(
        pkgs.map(((pkg) =>
            getCurrentNpmVersion(pkg))));

    return JSON.stringify(pkgVersions);
};

const stringify = (obj) =>
    Object.entries(obj)
        .reduce((res, [key, value]) => {
            res[key] = value.indexOf("\"") !== 0 ?
                JSON.stringify(value) : value;
            return res;
        }, {});

const updateDefinePlugin = async (config, withDefinitions) => {
    const definePlugin = config.plugins.find((plugin) =>
        plugin instanceof webpack.DefinePlugin) || { definitions: {} };

    const definitions = await withDefinitions(definePlugin.definitions);

    if (definePlugin) {
        definePlugin.definitions = definitions
    } else {
        config.plugins.push(new webpack.DefinePlugin(definitions));
    }

    return config;
};

const addEnvParams = async (config) =>
    await updateDefinePlugin(config, async (definitions) => {
        return {
            ...definitions,
            "PUBLISHED_VERSIONS": await getAllPackagesVersions(),
            "LOCAL_PORT": `"${process.env.LOCAL_PORT}"`,
            "process.env": {
                ...(definitions["process.env"] || stringify(process.env)),
                BUILD_TIME_VERSION: JSON.stringify(getUploadyVersion()),
                CIRCLECI: JSON.stringify(process.env.CIRCLECI),
                CIRCLECI_BRANCH: JSON.stringify(process.env.CIRCLE_BRANCH),
                SB_INTERNAL: JSON.stringify(process.env.SB_INTERNAL),
            }
        };
    });

const updateHtmlTitle = (config) => {
    const htmlPlugin = config.plugins.find((plugin) =>
        plugin instanceof HtmlWebpackPlugin);

    if (htmlPlugin) {
        htmlPlugin.userOptions.title = "React-Uploady Official Storybook";
    }

    return config;
}

const createPackageAliases = () =>
    getMatchingPackages()
        .reduce((res, p) => ({
            ...res,
            [p.name]: path.resolve(`./${p.location}/src/index.js`)
        }), {});

export default {
    webpackFinal: async (config) => {
        config.resolve = {
            ...config.resolve,
            mainFields: ["main:dev"].concat(config.resolve.mainFields).filter(Boolean),

            alias: createPackageAliases(),
        };

        config.mode = config.mode || process.env.SB_OPTIMIZE ? "production" : "development";

        config.optimization = config.optimization || {};
        config.optimization.minimize = !!process.env.SB_OPTIMIZE;

        config.stats = config.stats || {}
        config.stats.errorDetails = true;

        config = updateHtmlTitle(config);

        return addEnvParams(config);
    },
};
