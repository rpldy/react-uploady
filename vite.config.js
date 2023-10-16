/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import { esbuildFlowPlugin } from "@bunchtogether/vite-plugin-flow";
import babelPlugin from "vite-plugin-babel";
import { getMatchingPackages } from "./scripts/lernaUtils";

const createPackageAliases = () => {
    const packages = getMatchingPackages();
    return packages.reduce((res, p) => {
        res.push({
            find: new RegExp(`^${p.name}$`),
            replacement: path.resolve(`./${p.location}/src/index.js`)
        });

        return res;
    }, []);
};

export default defineConfig({
    plugins: [
        babelPlugin({
            //passing specific config because setup file breaks when using config file
            babelConfig: {
                babelrc: false,
                configFile: false,
                plugins: ["@babel/plugin-proposal-export-default-from"],
                presets: [
                    [
                        "@babel/env",
                        {
                            "modules": false,
                        },
                    ],
                    "@babel/react", "@babel/flow"]
            },
        }),
    ],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./test/vitest-setup.js",
        include: ["packages/**/*.test.js?(x)"],
        coverage: {
            provider: "istanbul",
            thresholdAutoUpdate: true,
            reporter: ["lcov", "json", "text", "html"],
            lines: 99.95,
            branches: 98.32,
            functions: 100,
            statements: 99.95,
            perFile: false,
            exclude: ["**/*.mock.*"]
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
