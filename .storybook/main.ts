import path from "path";
import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
    stories: [
        "../packages/**/*.stories.js",
        "./welcome.stories.mdx"
    ],
    addons: [
        path.resolve("./.storybook/uploadyPreset"),
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
    ],
    framework: {
        name: "@storybook/react-webpack5",
        options: {},
    },
    docs: {
        autodocs: "tag",
    },
    core: {
        disableTelemetry: true
    },
};

export default config;
