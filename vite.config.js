/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { flowPlugin, esbuildFlowPlugin } from "@bunchtogether/vite-plugin-flow";
import babelPlugin from "vite-plugin-babel";
import { getMatchingPackages } from "./scripts/lernaUtils";

const createPackageAliases = () => {
    const packages = getMatchingPackages();
    // console.log("CREATED ALIASES ", aliases);
    return packages.reduce((res, p) => {
        //{ find:/^i18n\!(.*)/, replacement: '$1.js' }
        res.push({
            find: new RegExp(`^${p.name}$`),
            replacement: path.resolve(`./${p.location}/src/index.js`)
        });
        // res[`^${p.name}$`] = path.resolve(`./${p.location}/src/index.js`);
        // res[`^${p.name}\/(.*)`] = path.resolve(`./${p.location}/$1`);
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
                plugins: ["@babel/plugin-proposal-export-default-from"],
                presets: ["@babel/react"]
            },
        }),
        react()
    ],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./test/vitest-setup.js",
        include: ["packages/**/*.test.js?(x)"],
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
