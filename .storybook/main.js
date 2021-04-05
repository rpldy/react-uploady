const glob = require("fast-glob"),
    path = require("path");

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
        path.resolve("./.storybook/uploadyPreset"),
        // "./.storybook/cypressAddon/register",
    ],

    // webpackFinal: async (config) => { return config; },
    // managerWebpack: async (baseConfig, options) =>  { return baseConfig; }
};
