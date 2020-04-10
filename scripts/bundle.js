#!/usr/bin/env node
const path = require("path"),
    fs = require("fs-extra"),
    yargs = require("yargs"),
    webpack = require("webpack"),
    shell = require("shelljs"),
    bytes = require("bytes"),
    _ = require("lodash"),
    wpMerge = require("webpack-merge"),
    { logger, getMatchingPackages } = require("./utils");

const options = {
    validate: yargs.argv.validate,
    outputPath: yargs.argv.out,
    debugBundleSize: yargs.argv.debugSize,
};

const ORG = "@rpldy/";

const TARGETS = {
    umd: "umd",
};

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
        /**
         * Build a bundle with the core functionality (no UI)
         */
        "core": {
            maxSize: 9500,
            pkgs: [PKGS.LIFE_EVENTS, PKGS.SHARED, PKGS.SENDER, PKGS.UPLOADER],
            target: PKGS.UPLOADER,
        },

        /**
         * Build a bundle with the core functionality + core UI
         */
        "ui-core": {
            maxSize: 12000,
            pkgs: ["core", PKGS.SHARED_UI, PKGS.UPLOADY],
            target: PKGS.UPLOADY,
            config: {
                externals: ["react", "react-dom"],
            },
        },

        /**
         * Build a bundle with the entire repo's functionality
         */
        // "all": {
        //
        // },

        "package": {
            pkgs: "*",
            target: "*", //output relative to package
            config: {
                externals: [/@rpldy/, "react", "react-dom"],
            }
        },
    },
};

const isProduction = process.env.NODE_ENV === "production";

const BASE_CONFIG = {
    mode: "development",

    devtool: "source-map",

    output: {
        path: path.join(process.cwd(), options.outputPath || "bundle"),
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

const getPackageRootFromName = (name, repoPackages) => {
    const parts = name.split("@"),
        pkgName = `${ORG}${parts[1]}`;

    return getEntryPath(pkgName, repoPackages);
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
                result = getPackageRootFromName(p, repoPackages);
            }
        }

        return result;
    });

    return _.flatten(entries);
};

const validateSize = (type, name, file) => {
    const maxSize = _.get(BUNDLES, [type, name, "maxSize"]);

    if (isProduction && maxSize) {
        const result = shell.exec(`bundlesize -f ${file} -s ${maxSize} ${options.debugBundleSize ? "--debug" : ""}`);

        if (result.code) {
            throw new Error(`bundle: ${file} exceeds allowed maxSize: ${bytes(maxSize)}`)
        }
    }
};

const runWebpack = (type, name, config) => {
    return new Promise((resolve, reject) => {
        try {
            webpack(config,
                (err, stats) => {
                    const info = stats.toJson();

                    if (err || stats.hasErrors()) {
                        err = err || info.errors;
                        logger.error(`!!! failed to compile bundle: ${name} (type: ${type})`, err);
                        reject();
                    } else {

                        const result = {
                            time: info.time,
                            outputPath: info.outputPath,
                            assets: info.assets,
                        };

                        resolve(result);
                    }
                });
        } catch (e) {
            logger.error(`!!! failed to start compile for bundle: ${name} (type: ${type})`, e);
            reject()
        }

    });
};

const copyBundleToTarget = (type, definition, outputFile, repoPackages) => {
    const pkgRoot = getPackageRootFromName(definition.target, repoPackages);
    const dest = path.join(pkgRoot, TARGETS[type]);
    fs.ensureDirSync(dest);
    fs.copyFileSync(outputFile, path.join(dest, path.basename(outputFile)));
};

const createBundleFromDefinition = async (type, name, definition, repoPackages) => {
    const entries = getEntriesFromDefinition(definition, type, repoPackages);

    logger.verbose(`>>>> creating bundle: ${name} of type: ${type} - entries: `, entries);

    const bundleConfig = wpMerge(
        BASE_CONFIG,
        isProduction ? PROD_CONFIG : {},
        {
            entry: {
                [name]: entries
            },

            output: {
                filename: `rpldy-${name}.${type}${isProduction ? ".min" : ""}.js`,
                library: ["rpldy", "[name]"],
                libraryTarget: type,
            }
        },
        definition.config,
    );

    let result, outputFile;

    try {
        result = await runWebpack(type, name, bundleConfig);
        outputFile = path.join(result.outputPath, result.assets[0].name);

        if (definition.target) {
            copyBundleToTarget(type, definition, outputFile, repoPackages);
        }

        logger.log(`>>>> saved bundle (${type}.${name}) to: ${outputFile} in ${result.time} ms`);
    } catch (e) {
        throw new Error("Webpack compile failed !");
    }

    if (options.validate && result) {
        validateSize(type, name, outputFile);
    }
};

const doBundle = async () => {
    logger.info(`>>> bundling packages (mode: production = ${isProduction})`);

    const { packages: repoPackages } = await getMatchingPackages({});
    const bundlers = [];

    Object.entries(BUNDLES)
        .forEach(([type, bundle]) => {
            Object.entries(bundle)
                .forEach(([name, definition]) => {
                    bundlers.push(
                        createBundleFromDefinition(type, name, definition, repoPackages)
                    );
                });
        });

    try {
        logger.verbose(`>>> waiting for ${bundlers.length} bundles to compile`);
        await Promise.all(bundlers);
        logger.info(`>>> Finished bundling successfully!`);
    } catch (e) {
        logger.error(`!!!! Failed to bundle`, e);
    }
};

doBundle();
