/// <reference types="vitest" />
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { defineConfig } from "vite";
import babel from "@babel/core";
import { getMatchingPackages } from "./scripts/lernaUtils.mjs";

const require = createRequire(import.meta.url);

const isCI = !!process.env.CI;

const BABEL_CONFIG = {
    babelrc: false,
    configFile: false,
    plugins: [
        ["babel-plugin-transform-flow-enums", {
            //avoid using flow-enums-runtime, just return a frozen "enum" object
            getRuntime: (t) => t.arrowFunctionExpression(
                [t.identifier("enumObj")],
                t.callExpression(
                    t.memberExpression(t.identifier("Object"), t.identifier("freeze")),
                    [t.identifier("enumObj")]
                )
            )
        }],
        [
            "@babel/plugin-transform-runtime", {
            corejs: 3,
            "version": "^7.24.9"
        }],
        "@babel/plugin-proposal-export-default-from",
        "babel-plugin-syntax-hermes-parser",
    ],
    parserOpts: { flow: "all" },
    sourceMaps: "inline",
    presets: [
        [
            "@babel/env",
            {
                useBuiltIns: false,
                "modules": false,
            },
        ],
        "@babel/react",
        "@babel/flow",
    ],
};

// Replaces vite-plugin-babel: transforms .js/.jsx via Babel (including coverage-instrumented
// files whose IDs carry query strings like ?vitest-uncovered-coverage=true).
const babelTransformPlugin = {
    name: "babel-transform",
    enforce: "pre",
    transform(code, id) {
        const cleanId = id.split("?")[0];

        if (!/\.jsx?$/.test(cleanId) || cleanId.includes("node_modules")) {
            return null;
        }

        return babel.transformAsync(code, { ...BABEL_CONFIG, filename: cleanId })
            .then((result) => result ? { code: result.code, map: result.map } : null);
    },
};

const packages = getMatchingPackages();

// Resolves subpath imports like `@rpldy/pkg/foo` → packages/location/foo.js (or .jsx).
// Replaces the deprecated `customResolver` option in resolve.alias.
const packageSubpathPlugin = {
    name: "package-subpath-resolver",
    enforce: "pre",
    resolveId(source) {
        for (const p of packages) {
            const match = source.match(new RegExp(`^${p.name}/(.*)`));

            if (match) {
                const base = path.resolve(`${p.location}/${match[1]}.js`);
                return fs.existsSync(base) ? base : base + "x";
            }
        }

        return null;
    },
};

const createPackageAliases = () =>
    packages.map((p) => ({
        find: new RegExp(`^${p.name}$`),
        replacement: path.resolve(`./${p.location}/src/index.js`),
    }));

export default defineConfig({
    plugins: [
        babelTransformPlugin,
        packageSubpathPlugin,
    ],
    build: {
        sourcemap: true,
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./test/vitest-setup.mjs",
        include: ["packages/**/*.test.js?(x)"],
        exclude: ["packages/**/lib/**", "packages/**/node_modules/**"],
        coverage: {
            provider: "istanbul",
            thresholdAutoUpdate: true,
            reporter: ["lcov", "html"].concat(isCI ? ["json", "json-summary"] : []),
            thresholds: {
                lines: 99.95,
                branches: 98.32,
                functions: 100,
                statements: 99.95,
                perFile: false,
            },
            include: ["packages/**/src/**/*.js?(x)"],
            exclude: ["**/*.mock.*", "**/types.js", "packages/**/src/index.js", "**/*.test.js?(x)"],
        },
        css: false, // can help with source map accuracy
        reporters: ["verbose"],
    },
    resolve: {
        alias: [
            ...createPackageAliases(),
            // Ensure React is properly resolved and deduplicated
            { find: /^react$/, replacement: require.resolve("react") },
            { find: /^react-dom$/, replacement: require.resolve("react-dom") },
        ]
    }
});
