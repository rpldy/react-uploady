import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import pacote from "pacote";
import { getMatchingPackages } from "../scripts/lernaUtils.mjs";
import { getUploadyVersion } from "../scripts/uploadyVersion.mjs";
import path from "path";
import { createRequire } from "module";
import { log } from "console";

const require = createRequire(import.meta.url);

const getCurrentNpmVersion = async (pkg): Promise<{ name: string; version: string } | null> => {
    let result: { name: string; version: string } | null = null;

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

    return pkgVersions;
};

const stringify = (obj: Record<string, any>) =>
    Object.entries(obj)
        .reduce((res: Record<string, string>, [key, value]: [string, any]) => {
            res[key] = typeof value === 'string' && value.indexOf("\"") !== 0 ?
                JSON.stringify(value) : value;
            return res;
        }, {});

const updateDefinePlugin = async (config, withDefinitions) => {
    // Find all DefinePlugin instances
    const definePlugins = config.plugins.filter((plugin) =>
        plugin instanceof webpack.DefinePlugin);
    
    // Merge all existing definitions
    const existingDefinitions = definePlugins.reduce((acc, plugin) => {
        return { ...acc, ...plugin.definitions };
    }, {});

    const newDefinitions = await withDefinitions(existingDefinitions);

    // Remove all existing DefinePlugins
    config.plugins = config.plugins.filter(
        (plugin) => !(plugin instanceof webpack.DefinePlugin)
    );

    // Add a single merged DefinePlugin
    config.plugins.push(new webpack.DefinePlugin(newDefinitions));

    return config;
};

const addEnvParams = async (config) =>
    await updateDefinePlugin(config, async (definitions) => {
        const buildVersion = getUploadyVersion()
        console.info(`Uploady StoryBook Build - Uploady Version: ${buildVersion}`);

        // Get existing process.env definitions, handling both object and string formats
        const existingProcessEnv = definitions["process.env"] || {};
        const existingProcessEnvObj = typeof existingProcessEnv === 'object' 
            ? existingProcessEnv 
            : {};

        const pkgVersions = await getAllPackagesVersions();
        const pkgVersionsJson = JSON.stringify(pkgVersions);
        
        console.log("...Setting PUBLISHED_VERSIONS in DefinePlugin");
        console.log("...Number of packages:", pkgVersions.length);
        console.log("...First package:", pkgVersions[0]);

        const processEnvDefs = {
            ...existingProcessEnvObj,
            ...stringify(process.env),
            PUBLISHED_VERSIONS: pkgVersionsJson, // Already a JSON string
            BUILD_TIME_VERSION: JSON.stringify(buildVersion),
            SB_INTERNAL: JSON.stringify(process.env.SB_INTERNAL || ""),
            NODE_ENV: JSON.stringify(process.env.NODE_ENV || "development"),
            LOCAL_PORT: JSON.stringify(process.env.LOCAL_PORT || ""),
        };

        return {
            ...definitions,
            // For DefinePlugin, we need to provide the value as a string representation
            // pkgVersionsJson is already a JSON string like "[{...}]"
            // JSON.stringify wraps it in quotes so it becomes a string literal in the code
            "PUBLISHED_VERSIONS": JSON.stringify(pkgVersionsJson),
            "LOCAL_PORT": `"${process.env.LOCAL_PORT || ""}"`,
            // Define process.env as an object so process.env.X accesses work
            "process.env": processEnvDefs,
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
        const packageAliases = createPackageAliases();
        const existingAlias = config.resolve?.alias || {};
        
        config.resolve = {
            ...config.resolve,
            mainFields: ["main:dev"].concat(config.resolve?.mainFields || []).filter(Boolean),

            alias: {
                ...(typeof existingAlias === 'object' && !Array.isArray(existingAlias) ? existingAlias : {}),
                ...packageAliases,
            },
            // Add fallbacks for Node.js modules that webpack 5 no longer polyfills
            fallback: {
                ...config.resolve?.fallback,
                "tty": require.resolve("tty-browserify"),
            },
        };

        config.mode = config.mode || process.env.SB_OPTIMIZE ? "production" : "development";

        config.optimization = config.optimization || {};
        config.optimization.minimize = !!process.env.SB_OPTIMIZE;

        config.stats = config.stats || {}
        config.stats.errorDetails = true;

        config = updateHtmlTitle(config);

        // addEnvParams now properly merges all DefinePlugin definitions
        return await addEnvParams(config);
    },
};
