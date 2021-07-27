const webpack = require("webpack"),
    pacote = require("pacote"),
    { getUploadyVersion } = require("../scripts/utils");

const getCurrentNpmVersion = async () => {
    let result = [];

    try {
        const manifest = await pacote.manifest("@rpldy/uploady");
        const uploader = "@rpldy/uploader";

        result = [
            `${manifest.name} ${manifest.version}`,
            `${uploader} ${manifest.dependencies[uploader].replace(/[\^~]/, "")}`
        ];
    } catch (e) {
        console.error("FAILED TO GET NPM VERSION !!!!!", e);
    }

    return result;
}

const addEnvParams = async (config) => {
    const publishedVersion = config.mode !== "development" ? await getCurrentNpmVersion() : ["DEV"];
    const definePlugin = config.plugins.find((plugin) =>
        plugin instanceof webpack.DefinePlugin) || { definitions: {} };

    const definitions = {
        ...definePlugin.definitions,
        "PUBLISHED_VERSION": JSON.stringify(publishedVersion),
        "LOCAL_PORT": `"${process.env.LOCAL_PORT}"`,
        "process.env": {
            ...(definePlugin.definitions["process.env"] || process.env),
            BUILD_TIME_VERSION: JSON.stringify(getUploadyVersion()),
            CIRCLECI: process.env.CIRCLECI,
            CIRCLECI_BRANCH: process.env.CIRCLE_BRANCH,
        }
    }

    if (definePlugin) {
        definePlugin.definitions = definitions
    } else {
        config.plugins.push(new webpack.DefinePlugin(definitions));
    }

    return config;
};

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

        return await addEnvParams(config);
    },
};
