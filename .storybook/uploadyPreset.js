const webpack = require("webpack"),
    { getMatchingPackages } = require("../scripts/lernaUtils"),
    { getUploadyVersion } = require("../scripts/utils");

const getAllPackagesVersions = async () => {
    const pkgs = await getMatchingPackages({});

    const pkgVersions = await Promise.all(
        pkgs.packages.map(((pkg) =>
            getCurrentNpmVersion(pkg))));

    return JSON.stringify(pkgVersions);
};

const getCurrentNpmVersion = async (pkg) => {
    let result = null;

    try {
        result = { name: pkg.name, version: pkg.version};
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

const addEnvParams = async (config) =>
    await updateDefinePlugin(config, async (definitions) => {
        return {
            ...definitions,
            "PUBLISHED_VERSIONS": await getAllPackagesVersions(config),
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
            use: [{
                loader: require.resolve("@storybook/source-loader"),
                options: { parser: "flow" },
            }],
            enforce: "pre",
        });
        //
        // config.module.rules.push({
        //     test: /\.m?js/,
        //     resolve: {
        //         fullySpecified: false
        //     }
        // });

        config.resolve = {
            ...config.resolve,
            mainFields: ["main:dev"].concat(config.resolve.mainFields),
        };

        config.optimization.minimize = !!process.env.SB_OPTIMIZE;

        config.stats.errorDetails = true;

        return addEnvParams(config);
    },

    managerWebpack: async (config) => {
        //fixing issue with module imports not using extensions: https://github.com/webpack/webpack/issues/11467#issuecomment-691873586
        config.module.rules.push({
            test: /\.m?js/,
            resolve: {
                fullySpecified: false
            }
        });

        return updateDefinePlugin(config, async (definitions) => ({
            ...definitions,
            "PUBLISHED_VERSIONS": await getAllPackagesVersions(config),
        }));
    }
};
