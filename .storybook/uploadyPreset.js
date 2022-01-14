const webpack = require("webpack"),
    pacote = require("pacote"),
    { getMatchingPackages } = require("../scripts/lernaUtils"),
    { getUploadyVersion } = require("../scripts/utils");

const getAllPackagesVersions = async () => {
    const pkgs = await getMatchingPackages({});

    // const publishedVersion = config.mode !== "development" ?
    //     await getCurrentNpmVersion() : ["DEV"];
    const pkgVersions = await Promise.all(pkgs.packages.map(getCurrentNpmVersion));

    return JSON.stringify(pkgVersions);
};

const getCurrentNpmVersion = async (pkg) => {
    let result = null;

    try {
        const manifest = await pacote.manifest(pkg.name);
        result = { name: manifest.name, version: manifest.version };
    } catch (e) {
        console.error("FAILED TO GET NPM VERSION !!!!!", e);
    }

    return result;
}

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

const addEnvParams = (config) =>
    updateDefinePlugin(config, async (definitions) => {
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

module.exports = {
    webpack: async (config) => {
        config.module.rules.push({
            test: /\.stor(y|ies)\.jsx?$/,
            loaders: [{
                loader: require.resolve("@storybook/source-loader"),
                options: { parser: "flow" },
            }],
            enforce: "pre",
        });

        config.resolve = {
            mainFields: ["main:dev", "module", "main"],
        };

        config.optimization.minimize = !!process.env.SB_OPTIMIZE;

        // config.stats.errorDetails = true;

        return addEnvParams(config);
    },

    managerWebpack: async (config) => {
        return updateDefinePlugin(config, async (definitions) => ({
            ...definitions,
            "PUBLISHED_VERSIONS": await getAllPackagesVersions(),
        }));
    }
};
