import { createRequire } from "node:module";
/* eslint storybook/story-exports:0 storybook/csf-component:0*/
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { StorybookConfig } from "@storybook/react-webpack5";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
    stories: [
        "./welcome.storydoc.mdx",
        "../packages/**/*.stories.js"
    ],

    addons: [path.resolve(__dirname, "uploadyPreset.ts"), getAbsolutePath("@storybook/addon-links"), {
        name: getAbsolutePath("@storybook/addon-docs"), //path.dirname(require.resolve("@storybook/addon-docs/package.json")),
        options: {
            transcludeMarkdown: true
        },
    }, getAbsolutePath("@storybook/addon-webpack5-compiler-babel")],

    framework: {
        name: getAbsolutePath("@storybook/react-webpack5"),
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

    features: {
        actions: true,
        backgrounds: false,
        controls: true,
        viewport: false
    }
};

export default config;

function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, "package.json")));
}
