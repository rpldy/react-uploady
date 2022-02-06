const glob = require("fast-glob"),
    path = require("path");

module.exports = {
    stories: async () => {
        const paths = await glob(
            [
                "../packages/**/*.stories.js",
                "!../packages/**/node_modules"
            ], {
                cwd: path.join(process.cwd(), ".storybook")
            });

        return ["./welcome.stories.mdx"].concat(paths);
    },
    addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-knobs",
        "@storybook/addon-storysource",
        path.resolve("./.storybook/uploadyPreset")
        // "./.storybook/cypressAddon/register",
    ],
    features: {
        postcss: false,
        babelModeV7: true,
        // storyStoreV7: true
    },
    core: {
        builder: "webpack5" //"webpack4"

    },
    framework: "@storybook/react"

    // babel: async (config) => {
    //     console.log(">>>>>>> BABEL CONFIG FROM SB: " + process.env.NODE_ENV , config);
    //     return config;
    // },
    // webpackFinal: async (config) => { return config; },
    // managerWebpack: async (baseConfig, options) =>  { return baseConfig; }
};
