const glob = require("fast-glob"),
    path = require("path");

const getAbsolutePath = (value) =>
    path.dirname(require.resolve(path.join(value, "package.json")));

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
        // getAbsolutePath("@storybook/addon-essentials"),
        {
            name: "@storybook/addon-essentials",
            options: {
                docs: true,
                actions: true,
                backgrounds: true,
                controls: true
            }
        },
        getAbsolutePath("@storybook/addon-knobs"),
    ],

    features: {
        postcss: false,
        babelModeV7: true,
        // storyStoreV7: true
    },

    core: {
        disableTelemetry: true
    },

    framework: {
        name: getAbsolutePath("@storybook/react-webpack5"),
        options: {}
    },

    docs: {
        autodocs: true
    }
};
