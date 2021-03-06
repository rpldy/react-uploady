const glob = require("fast-glob"),
    path = require("path"),
    webpack = require("webpack"),
    pacote = require("pacote");

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

module.exports = {
    stories: async () => {
        const paths = await glob(
            [
                "../packages/**/*.stories.js",
                "!../packages/**/node_modules"
            ],
           { cwd: path.join(process.cwd(), ".storybook") });

        return ["./welcome.story.js"].concat(paths);
    },

    addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-knobs",
        "@storybook/addon-storysource",
        // "./.storybook/cypressAddon/register",
    ],

    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.stor(y|ies)\.jsx?$/,
            loaders: [{
                loader: require.resolve("@storybook/source-loader"),
                options: { parser: "flow" },
            }],
            enforce: "pre",
        });

        config.plugins.push(new webpack.DefinePlugin({
            "BUILD_TIME_VERSION": JSON.stringify(config.mode !== "development" ? await getCurrentNpmVersion() : ["DEV"] ),
            "LOCAL_PORT": `"${process.env.LOCAL_PORT}"`,
        }));

        config.resolve = {
            mainFields: ["main:dev", "module", "main"],
        };

        config.optimization.minimize = false;

        return config;
    },
};
