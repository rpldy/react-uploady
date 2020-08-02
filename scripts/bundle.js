#!/usr/bin/env node
const path = require("path"),
    fs = require("fs-extra"),
    yargs = require("yargs"),
    webpack = require("webpack"),
    shell = require("shelljs"),
    bytes = require("bytes"),
    _ = require("lodash"),
    { merge: wpMerge } = require("webpack-merge"),
    { logger, getMatchingPackages } = require("./utils");

//TODO: should be passed by options or found in root (dynamically)
const config = require("../bundle.config");

const options = {
    validate: yargs.argv.validate,
    outputPath: yargs.argv.out,
    bundle: yargs.argv.bundle,
    debugBundleSize: yargs.argv.debugSize,
};

const isProduction = process.env.NODE_ENV === "production";

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

const findTypeDefinition = (type, name) =>
    _.get(config.bundles, [type, name]);

const getPackageRootFromName = (name, repoPackages) => {
    const parts = name.split("@"),
        pkgName = `${config.org}${parts[1]}`;

    return getEntryPath(pkgName, repoPackages);
};

const getEntriesFromDefinition = ({ pkgs }, type, repoPackages) => {
    pkgs = [].concat(pkgs);

    const entries = pkgs.map((p) => {
        let result;

        if (p === "*") {
            result = repoPackages;
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

const validateSize = (type, name, wpResult) => {
    const maxSize = _.get(config.bundles, [type, name, "maxSize"]);

    if (isProduction && maxSize) {
        const mainAssetNamePrefix = `${config.library}-${name}.${type}`;
        const mainAsset = wpResult.assets.find((a) => a.name.startsWith(mainAssetNamePrefix));
        const outputFile = path.join(wpResult.outputPath, mainAsset.name);

        const result = shell.exec(`bundlesize -f ${outputFile} -s ${maxSize} ${options.debugBundleSize ? "--debug" : ""}`);

        if (result.code) {
            throw new Error(`bundle: ${outputFile} exceeds allowed maxSize: ${bytes(maxSize)}`)
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
                        resolve({
                            time: info.time,
                            outputPath: info.outputPath,
                            assets: info.assets,
                        });
                    }
                });
        } catch (e) {
            logger.error(`!!! failed to start compile for bundle: ${name} (type: ${type})`, e);
            reject();
        }
    });
};

const copyBundleToTarget = (assets, outputPath, type, pkgRoot) => {
    const dest = path.join(pkgRoot, config.targets[type]);
    fs.ensureDirSync(dest);

    assets.forEach((asset) => {
        const outputFile = path.join(outputPath, asset.name);
        fs.copyFileSync(outputFile, path.join(dest, path.basename(outputFile)));
    });
};

const findExtraBundles = (wpResult, definition) => {
    let extra = [];

    if (definition.extraBundles) {
        extra = wpResult.assets.filter((a) =>
            !!~definition.extraBundles.indexOf(a.name));
    }

    return extra;
};

const handleBundleOutput = (type, definition, wpResult, repoPackages) => {
    if (definition.target) {
        const outputPath = wpResult.outputPath;

        if (definition.target === "*") {
            repoPackages.forEach((pkg) => {
                const bundleFileName = `${pkg.name.replace(/(@)(\w+)(\/)/, (m, p, p2) => p2 + "\\.")}`,
                    assetsRgx = new RegExp(definition.bundlePattern.replace("*", bundleFileName))

                const assets = [
                    ...wpResult.assets.filter((a) => assetsRgx.test(a.name)),
                    ...findExtraBundles(wpResult, definition),
                ];

                if (assets.length) {
                    copyBundleToTarget(assets, outputPath, type, pkg.location);
                } else {
                    throw new Error(`Didn't find matching bundle for package: ${pkg.name} - bundle: ${bundleFileName}`);
                }
            });
        } else {
            const pkgRoot = getPackageRootFromName(definition.target, repoPackages);
            copyBundleToTarget(wpResult.assets, outputPath, type, pkgRoot);
        }
    }
};

const getWebpackConfig = (type, name, definition, repoPackages) => {
    const entries = getEntriesFromDefinition(definition, type, repoPackages);

    logger.verbose(`>>>> creating bundle: '${name}' of type: '${type}' - with entries: `, entries);

    return wpMerge(
        config.webpackConfig.base,
        config.webpackConfig[process.env.NODE_ENV] || {},
        {
            entry: Array.isArray(definition.pkgs) ? {
                [_.camelCase(name)]: entries
            } : undefined,

            output: {
                path: path.join(process.cwd(), options.outputPath || "bundle"),
                filename: `${config.fileNamePrefix || config.library}-${name}.${type}${isProduction ? ".min" : ""}.js`,
                library: config.library,
                libraryTarget: type,
                // globalObject: "this",
            },
        },
        _.isFunction(definition.config) ? definition.config(entries, isProduction, definition) : (definition.config || {}),
    );
}

const createBundleFromDefinition = async (type, name, definition, repoPackages) => {
    let wpResult;

    const bundleConfig = getWebpackConfig(type, name, definition, repoPackages);

    try {
        wpResult = await runWebpack(type, name, bundleConfig);
        logger.log(`>>>> bundle (${type}.${name}) created in ${wpResult.time} ms`);

        handleBundleOutput(type, definition, wpResult, repoPackages);
    } catch (e) {
        throw new Error("Webpack compile failed ! " + e.message);
    }

    if (options.validate && wpResult) {
        validateSize(type, name, wpResult);
    }
};

const doBundle = async () => {
    logger.info(`>>> bundling packages (mode: production = ${isProduction})`);

    const { packages: repoPackages } = await getMatchingPackages({});
    const bundlers = [];

    if (options.bundle) {
        //only bundle the definition requested by argument
        const parts = options.bundle.split("."),
            definition = _.get(config.bundles, parts);

        bundlers.push(createBundleFromDefinition(parts[0], parts[1], definition, repoPackages));
    } else {
        //bundle all definitions in config
        Object.entries(config.bundles)
            .forEach(([type, bundle]) => {
                Object.entries(bundle)
                    .forEach(([name, definition]) => {
                        bundlers.push(
                            createBundleFromDefinition(type, name, definition, repoPackages)
                        );
                    });
            });
    }

    try {
        logger.verbose(`>>> waiting for ${bundlers.length} bundles to compile`);
        await Promise.all(bundlers);
        logger.info(`>>> Finished bundling successfully!`);
    } catch (e) {
        logger.error(`!!!! Failed to bundle`, e);
        process.exit(1);
    }
};

doBundle();
