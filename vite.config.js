/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { flowPlugin, esbuildFlowPlugin } from "@bunchtogether/vite-plugin-flow";
import { getMatchingPackages } from "./scripts/lernaUtils";
import path from "path";

const createPackageAliases = () => {
    const packages = getMatchingPackages();
    const aliases = packages.reduce((res, p) => {
        //{ find:/^i18n\!(.*)/, replacement: '$1.js' }
        res.push({
            find: new RegExp(`^${p.name}$`),
            replacement: path.resolve(`./${p.location}/src/index.js`)
        });
        // res[`^${p.name}$`] = path.resolve(`./${p.location}/src/index.js`);
        // res[`^${p.name}\/(.*)`] = path.resolve(`./${p.location}/$1`);
        return res;
    }, []);

    // console.log("CREATED ALIASES ", aliases);
    return aliases
};

export default defineConfig({
    plugins: [flowPlugin(), react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./test/vitest-setup.js",
        include: ["packages/**/*.test.js"],
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
