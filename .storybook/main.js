module.exports = {
    stories: [
        "../packages/**/*.stories.js"
        // "../packages/**/!(node_modules/)*.stor(y|ies).js"
        // "../packages/*/!(node_modules)/*.stories.js",
        // "../packages/**/!(node_modules)*.stories.js"
    ],

    addons: [
        "@storybook/addon-actions/register",
        "@storybook/addon-knobs/register",
        "@storybook/addon-storysource/register",
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
