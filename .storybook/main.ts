import type { StorybookConfig } from "@storybook/react-webpack5";

import path from "path";

const getAbsolutePath = (value) =>
    path.dirname(require.resolve(path.join(value, "package.json")));

const config: StorybookConfig = {
    stories: [
        "../packages/**/*.stories.js",
        "./welcome.stories.mdx"
    ],
    addons: [
        path.resolve("./.storybook/uploadyPreset"),
        getAbsolutePath("@storybook/addon-links"),
        getAbsolutePath("@storybook/addon-essentials"),
        getAbsolutePath("@storybook/addon-onboarding"),
        getAbsolutePath("@storybook/addon-interactions"),
        getAbsolutePath("@storybook/addon-knobs"),
    ],
    framework: {
        name: getAbsolutePath("@storybook/react-webpack5"),
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
