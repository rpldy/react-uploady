const glob = require("fast-glob"),
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
    }
    catch (e) {
        console.error("FAILED TO GET NPM VERSION !!!!!", e);
    }

    return result;
}

module.exports = {
    stories: async () => {
        const paths = await glob(["./packages/**/*.stories.js", "!**/node_modules"]);
        return ["./welcome.story.js"]
            .concat(paths.map((p) => `.${p}`));
    },

    addons: [
        "@storybook/addon-actions/register",
        "@storybook/addon-knobs/register",
        "@storybook/addon-storysource/register",
        "storybook-readme/register",
        "./.storybook/cypressAddon/register",
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
            "rpldyVersion": JSON.stringify(await getCurrentNpmVersion()),
        }));

        return config;
    },
};
