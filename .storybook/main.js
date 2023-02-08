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
        path.resolve("./.storybook/uploadyPreset"),
        {
            //have to explicitly specify docs addon to turn off sourceLoader
            name: "@storybook/addon-docs",
            options: {
                //sourceLoader breaks on flow typings...
                sourceLoaderOptions: null,
            }
        },
        "@storybook/addon-essentials",
        "@storybook/addon-knobs",
    ],
    features: {
        postcss: false,
        babelModeV7: true,
        // storyStoreV7: true
    },
    core: {
        builder: "webpack5",
        disableTelemetry: true,
    },
    framework: "@storybook/react",
};
