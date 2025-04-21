import globals from "globals";
import js from "@eslint/js";
import ts from "typescript-eslint";
import hermesParser from "hermes-eslint";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import jsxA11YPlugin from "eslint-plugin-jsx-a11y";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import noAsyncPlugin from "eslint-plugin-no-async";
import ftFlowPlugin from "eslint-plugin-ft-flow";
import vitestPlugin from "eslint-plugin-vitest";
import storybookPlugin from "eslint-plugin-storybook";

const JS_RULES_OVERRIDES = {
    quotes: [2, "double", {
        allowTemplateLiterals: true,
    }],
    strict: 0,
    "no-unused-vars": [2, {
        vars: "all",
        args: "none",
    }],
    "max-len": [2, 155],
    eqeqeq: 2,
    "no-var": 2,
    "no-process-exit": 0,
    "no-underscore-dangle": 0,
    "no-loop-func": 0,
    "no-console": 2,
    "key-spacing": 0,
    "no-mixed-spaces-and-tabs": [2, "smart-tabs"],
    semi: [2, "always"],

    "no-trailing-spaces": [2, {
        skipBlankLines: false,
    }],

    camelcase: [1, {
        properties: "never",
    }],

    curly: 2,
    "object-curly-spacing": [2, "always"],
    "no-duplicate-imports": 0,

    "import/no-extraneous-dependencies": [2, {
        devDependencies: ["!(src|lib)/**"],
        optionalDependencies: false,
        peerDependencies: ["packages/**/src/**", "packages/**/*.stories.js"],
    }],

    "import/no-unresolved": 0,
    "import/no-named-as-default": 0,
    "import/extensions": 0,
    "import/no-dynamic-require": 0,
    "import/no-named-as-default-member": 1,
    "import/prefer-default-export": 0,
    "import/no-webpack-loader-syntax": 0,
    "import/no-duplicates": 2,
};

const REACT_RULES_OVERRIDES = {
    "react-hooks/rules-of-hooks": 2,
    "react-hooks/exhaustive-deps": 2,
    "jsx-a11y/href-no-hash": 0,
    "react/jsx-no-bind": 2,
    "react/require-render-return": 2,
    "react/jsx-boolean-value": 2,
    "react/jsx-key": 2,
    "react/jsx-uses-vars": 1,
    "react/jsx-uses-react": 1,
    "react/prefer-es6-class": 2,
    "react/jsx-pascal-case": 2,
    "react/no-direct-mutation-state": 2,
    "react/react-in-jsx-scope": 2,
    "react/jsx-no-duplicate-props": 2,
    "react/no-deprecated": 2,
    "react/jsx-no-undef": 2,
    "react/no-unknown-property": 2,
    "react/prop-types": 0,
    "react/jsx-quotes": 0,
    "react/boolean-prop-naming": 2,
    "react/jsx-closing-bracket-location": 0,
    "react/jsx-equals-spacing": [1, "never"],
    "jsx-quotes": 0,
    "react/jsx-sort-prop-types": 0,
    "react/jsx-filename-extension": 0,
    "react/forbid-prop-types": 0,
    "react/display-name": 0,
    "react/no-unused-prop-types": 0,
    "react/require-default-props": 0,
    "react/sort-comp": 0,
    "jsx-a11y/click-events-have-key-events": 0,
    "jsx-a11y/no-noninteractive-tabindex": 0,
    "jsx-a11y/no-interactive-element-to-noninteractive-role": 0,
    "jsx-a11y/no-noninteractive-element-to-interactive-role": 0,
    "jsx-a11y/no-noninteractive-element-interactions": 0,
    "jsx-a11y/no-onchange": 0,
    "jsx-a11y/label-has-for": [1, {
        components: ["Label"],
        required: {
            every: ["nesting", "id"],
        },
        allowChildren: true,
    }],
    "jsx-a11y/no-static-element-interactions": 0,
    "jsx-a11y/alt-text": 0,
    "jsx-a11y/media-has-caption": 0,
    "jsx-a11y/anchor-is-valid": 1,
};

const JS_LANGUAGE_OPTIONS = {
    parser: hermesParser,

    globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
        ...globals.commonjs,
        ENV: true,
        globalThis: false,
    },

    parserOptions: {
        "ecmaFeatures": {
            "jsx": true
        }
    },

    ecmaVersion: "latest",
    sourceType: "module",
};

const SHARED_SETTINGS = {
    ...ftFlowPlugin.configs.recommended.settings,
    react: {
        version: "detect",
        flowVersion: "0.260.0",
    },
};

const flatten = (configArr) =>
    configArr
        .reduce((res, config) => {
            res.rules = {
                ...res.rules,
                ...config.rules,
            };
            res.languageOptions = {
                ...res.languageOptions,
                ...config.languageOptions,
            };
            res.plugins = {
                ...res.plugins,
                ...config.plugins,
            }
            if (config.files) {
                res.files = [
                    ...(res.files || []),
                    ...config.files,
                ];
            }
            return res;
        }, { rules: {}, languageOptions: {}, plugins: {}, files: undefined });

const TS_CONFIG = flatten(ts.config(
    js.configs.recommended,
    ...ts.configs.recommended,
));

const SB_CONFIG = flatten(storybookPlugin.configs["flat/csf-strict"]);

export default [
    //Ignores
    {
        ignores: [
            "**/lib/**",
            "**/dist/**",
            "**/*.story.js",
            "**/*.stories.js",
            "node_modules",
            ".sb-static/**/*.*",
            "bundle/*.*",
            "cypress/examples/*.*",
            "cypress/component/*.*",
            "coverage/**/*.*",
            "flow-typed/**/**",
        ],
    },

    //Source Code (JS/React)
    {
        ...js.configs.recommended,

        files: ["packages/**/*.js", "packages/**/*.jsx"],
        ignores: ["**/*.test.js", "**/*.test.jsx", "**/*.mock.js", "**/*.mock.jsx", "story-helpers/*.*"],

        "plugins": {
            "ft-flow": ftFlowPlugin,
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            "jsx-a11y": jsxA11YPlugin,
            "no-async": noAsyncPlugin,
            import: importPlugin,
        },

        languageOptions: {
            ...JS_LANGUAGE_OPTIONS,
        },

        settings: {
            ...SHARED_SETTINGS,
            "ft-flow": {
                "onlyFilesWithFlowAnnotation": true,
            }
        },

        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...jsxA11YPlugin.configs.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            ...ftFlowPlugin.configs.recommended.rules,
            ...importPlugin.flatConfigs.recommended.rules,

            ...JS_RULES_OVERRIDES,
            ...REACT_RULES_OVERRIDES,

            "no-async/no-async": 2,
        },
    },

    //Unit Tests (VITEST)
    {
        files: ["packages/**/*.test.js", "packages/**/*.test.jsx", "packages/*.mock.jsx"],

        "plugins": {
            vitest: vitestPlugin,
            import: importPlugin,
        },

        languageOptions: {
            ...JS_LANGUAGE_OPTIONS,
        },

        settings: {
            ...SHARED_SETTINGS,
        },

        rules: {
            ...JS_RULES_OVERRIDES,
        }
    },

    //Types (Typescript)
    {
        ...TS_CONFIG,
        files: ["packages/**/*.ts", "packages/**/*.tsx"],

        rules: {
            ...TS_CONFIG.rules,
            "import/no-extraneous-dependencies": 0,
            "@typescript-eslint/no-explicit-any": 0,
            "@typescript-eslint/consistent-type-assertions": "warn",
            "@typescript-eslint/no-redeclare": "warn",
            "no-console": 0,
            "no-async/no-async": 0
        },
    },

    //Storybook
    {
        ...SB_CONFIG,

        files: [
            ...SB_CONFIG.files,
            "story-helpers/*.js",
            "story-helpers/*.jsx",
        ],

        "plugins": {
            "ft-flow": ftFlowPlugin,
            react: reactPlugin,
            ...SB_CONFIG.plugins,
        },

        ignores: ["packages/**/index.test-d.tsx", "/all-bundle-entry.js", "packages/**/src/**/*.js", "cypress/**/*.*"],

        languageOptions: {
            ...JS_LANGUAGE_OPTIONS,
        },

        settings: {
            ...SHARED_SETTINGS,
            "ft-flow": {
                "onlyFilesWithFlowAnnotation": true,
            }
        },

        rules: {
            ...SB_CONFIG.rules,
            "storybook/default-exports": 0,
            "no-console": 0,
        }
    }
];
