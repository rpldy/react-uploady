/// <reference types="vitest" />
import path from "path";
import fs from "fs";
import { defineConfig } from "vite";
import { esbuildFlowPlugin, flowPlugin } from "@bunchtogether/vite-plugin-flow";
import babelPlugin from "vite-plugin-babel";
import { getMatchingPackages } from "./scripts/lernaUtils.mjs";

const isCI = !!process.env.CI;

const createPackageAliases = () => {
    const packages = getMatchingPackages();
    return packages.reduce((res, p) => {
        res.push({
            find: new RegExp(`^${p.name}$`),
            replacement: path.resolve(`./${p.location}/src/index.js`)
        });

        res.push({
            find: new RegExp(`^${p.name}/(.*)`),
            replacement: `./${p.location}/$1.js`,
            customResolver: (importPath) => {
                const jsDep = path.resolve(importPath);
                return fs.existsSync(jsDep) ? jsDep : jsDep + "x";
            },
        })

        return res;
    }, []);
};

export default defineConfig({
    plugins: [
        flowPlugin(),
        babelPlugin({
            //passing specific config because setup file breaks when using config file
            babelConfig: {
                babelrc: false,
                configFile: false,
                plugins: [
                    [
                        "@babel/plugin-transform-runtime", {
                        corejs: 3,
                        "version": "^7.24.9"
                    }],
                    "@babel/plugin-proposal-export-default-from"
                ],
                presets: [
                    [
                        "@babel/env",
                        {
                            useBuiltIns: false,
                            "modules": false,
                        },
                    ],
                    "@babel/react",
                    "@babel/flow"]
            },
        }),
    ],
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
            include: ["packages/**/src/*.js?(x)"],
            exclude: ["**/*.mock.*", "**/types.js", "packages/**/src/index.js", "**/*.test.js?(x)"],
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [esbuildFlowPlugin()]
        }
    },
    resolve: {
        alias: createPackageAliases()
    }
});
