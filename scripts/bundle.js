#!/usr/bin/env node
const path = require("path"),
    yargs = require("yargs"),
    webpack = require("webpack"),
    _ = require("lodash"),
    wpMerge = require("webpack-merge"),
    { logger, getMatchingPackages } = require("./utils");

const options = {
    validate: yargs.argv.validate,
    outputPath: yargs.argv.out,
};

const ORG = "@rpldy/";

const PKGS = {
    LIFE_EVENTS: "@life-events",
    SHARED: "@shared",
    SENDER: "@sender",
    UPLOADER: "@uploader",
    SHARED_UI: "@shared-ui",
    UPLOADY: "@uploady",
};

const BUNDLES = {
    umd: {
        "core": {
            maxSize: 33000,
            pkgs: [PKGS.LIFE_EVENTS, PKGS.SHARED, PKGS.SENDER, PKGS.UPLOADER],
        },

        "ui-core": {
            maxSize: 42000,
            pkgs: ["core", PKGS.SHARED_UI, PKGS.UPLOADY],
            config: {
                externals: ["react", "react-dom"],
            },
        },

        // "all": {
        //     maxSize: 99999,
        //     pkgs: "*",
        //     config: {
        //         externals: [/@rpldy/],
        //     }
        // },
    },
};

const isProduction = process.env.NODE_ENV === "production";

const BASE_CONFIG = {
    mode: "development",

    devtool: "source-map",

    output: {
        path: path.join(process.cwd(), options.outputPath || "bundle"),
        // filename: "rpldy.[name].js",
        // library: ["rpldy", "[name]"],
        // libraryTarget: "umd"
    },

    module: {
        rules: [
            {
                test: /\.?js$/,
                exclude: /node_module/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },

    resolve: {
        alias: {
            "immer": path.resolve(__dirname, "../packages/shared/src/utils/produce"),
        }
    }
};

const PROD_CONFIG = {
    mode: "production",
    devtool: "cheap-module-source-map",
};

const getEntryPath = (pkgName, repoPackages) => {
    let result;
    const pkg = repoPackages.find((p) => p.name === pkgName);

    if (pkg) {
        result = pkg.location;
    } else {
        throw new Error(`package not found for: ${pkgName}`);
    }

    return result;
};

const findTypeDefinition = (type, name) => {
    return _.get(BUNDLES, [type, name]);
};

const getEntriesFromDefinition = ({ pkgs }, type, repoPackages) => {
    pkgs = [].concat(pkgs);

    const entries = pkgs.map((p) => {
        let result;

        if (p === "*") {
            //TODO: All packages as entries

        } else {
            const parts = p.split("@");

            if (parts.length === 1) {
                const subDefinition = findTypeDefinition(type, parts[0]);

                if (subDefinition) {
                    result = getEntriesFromDefinition(subDefinition, type, repoPackages);
                } else {
                    throw new Error(`couldn't find bundle definition for: ${parts[0]}`);
                }

            } else {
                const pkgName = `${ORG}${parts[1]}`;
                result = getEntryPath(pkgName, repoPackages);
            }
        }

        return result;
    });

    return _.flatten(entries);
};

const validateSize = (type, name) => {

};

const runWebpack = (type, name, config) => {
    return new Promise((resolve, reject) => {
        webpack(config,
            (err, stats) => {
                if (err || stats.hasErrors()) {
                    const info = stats.toJson();
                    err = err || info.errors;
                    logger.error(`!!! failed to compile bundle: ${name} (type: ${type})`, err);
                    reject();
                } else {
                    resolve();
                }
            });
    });
};

const createBundleFromDefinition = async (type, name, definition, repoPackages) => {
    const entries = getEntriesFromDefinition(definition, type, repoPackages);

    logger.verbose(`>>>> creating bundle: ${name} of type: ${type} - entries: `, entries);

    const bundleConfig = wpMerge(
        BASE_CONFIG,
        isProduction ? PROD_CONFIG : {},
        {
            entry: entries,

            output: {
                filename: `rpldy-${name}.${type}.js`,
                library: ["rpldy"],
                libraryTarget: type,
            }
        },
        definition.config,
    );

    try {
        await runWebpack(type, name, bundleConfig);

        if (options.validate) {
            validateSize(type, name);
        }

    } catch (e) {
        throw new Error("Webpack compile failed !");
    }
};

const doBundle = async () => {
    logger.info(`>>> bundling packages (mode: production = ${isProduction})`);

    const { packages: repoPackages } = await getMatchingPackages({});

    Object.entries(BUNDLES)
        .forEach(([type, bundle]) => {

            Object.entries(bundle)
                .forEach(([name, definition]) => {
                    createBundleFromDefinition(type, name, definition, repoPackages);
                });
        });
};

doBundle();
