/* eslint storybook/story-exports:0 storybook/csf-component:0*/
import path from "path";
import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
    stories: [
        "./welcome.storydoc.mdx",
        "../packages/**/*.stories.js"
    ],
    addons: [
        path.resolve("./.storybook/uploadyPreset"),
        "@storybook/addon-links",
        {
            name: "@storybook/addon-docs", //path.dirname(require.resolve("@storybook/addon-docs/package.json")),
            options: {
                transcludeMarkdown: true
            },
        },
        {
            name: "@storybook/addon-essentials",
            options: {
                actions: true,
                backgrounds: false,
                controls: true,
                docs: false,
                viewport: false,
                // toolbars: false
            }
        },
        "@storybook/addon-interactions",
        "@storybook/addon-webpack5-compiler-babel"
    ],
    framework: {
        name: "@storybook/react-webpack5",
        options: {},
    },
    // docs: {
    //     autodocs: true,
    // },
    core: {
        disableTelemetry: true
    },
    typescript: {
        // Overrides the default Typescript configuration to allow multi-package components to be documented via Autodocs.
        reactDocgen: "react-docgen-typescript",
        check: false,
        // skipCompiler: true,
        // skipBabel: true,
    },
};

export default config;
