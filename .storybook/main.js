const glob = require("fast-glob");

module.exports = {
    stories: async () => {
        const paths = await glob(["./packages/**/*.stories.js", "!**/node_modules"]);
        return paths.map((p)=> `.${p}`);
    },

    addons: [
        "@storybook/addon-actions/register",
        "@storybook/addon-knobs/register",
        "@storybook/addon-storysource/register",
        "storybook-readme/register",
        "./.storybook/cypressAddon/register",
    ],

    webpackFinal: (config) => {
        config.module.rules.push({
            test: /\.stor(y|ies)\.jsx?$/,
            loaders: [{
                loader: require.resolve("@storybook/source-loader"),
                options: { parser: "flow"},
            }],
            enforce: "pre",
        });

        return config;
    },
};
