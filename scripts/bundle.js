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

//TODO: should be passed by options or found in root (dynamically)
const config = require("../bundle.config");

const options = {
    validate: yargs.argv.validate,
    outputPath: yargs.argv.out,
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

const validateSize = (type, name, result) => {
    const outputFile = path.join(result.outputPath, result.assets[0].name);
    const maxSize = _.get(config.bundles, [type, name, "maxSize"]);

    if (isProduction && maxSize) {
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

const copyBundleToTarget = (asset, outputPath, type, pkgRoot) => {
    const outputFile = path.join(outputPath, asset.name);
    const dest = path.join(pkgRoot, config.targets[type]);
    const mapFile = `${outputFile}.map`;

    fs.ensureDirSync(dest);

    fs.copyFileSync(outputFile, path.join(dest, path.basename(outputFile)));
    fs.copyFileSync(mapFile, path.join(dest, path.basename(mapFile)));
};

const handleBundleOutput = (type, definition, result, repoPackages) => {
    if (definition.target) {

        const outputPath = result.outputPath;

        if (definition.target === "*") {
            repoPackages.forEach((pkg) => {
                const bundleName = `${pkg.name
                        .replace(/(@)(\w+)(\/)/, (m, p, p2) => p2 + ".")}${isProduction ? ".min" : ""}.js`,
                    asset = result.assets.find((a) => a.name === bundleName);

                if (asset) {
                    copyBundleToTarget(asset, outputPath, type, pkg.location);
                } else {
                    throw new Error(`Didn't find matching bundle for package: ${pkg.name} - bundle: ${bundleName}`);
                }
            });
        } else {
            const pkgRoot = getPackageRootFromName(definition.target, repoPackages);
            copyBundleToTarget(result.assets[0], outputPath, type, pkgRoot);
        }
    }
};

const getWebpackConfig = (type, name, definition, repoPackages) => {
    const entries = getEntriesFromDefinition(definition, type, repoPackages);

    logger.verbose(`>>>> creating bundle: ${name} of type: ${type} - entries: `, entries);

    return wpMerge(
        config.webpackConfig.base,
        config.webpackConfig[process.env.NODE_ENV],
        {
            entry: Array.isArray(definition.pkgs) ? {
                [name]: entries
            } : undefined,

            output: {
                path: path.join(process.cwd(), options.outputPath || "bundle"),
                filename: `rpldy-${name}.${type}${isProduction ? ".min" : ""}.js`,
                library: ["rpldy", "[name]"],
                libraryTarget: type,
            }
        },
        _.isFunction(definition.config) ? definition.config(entries, isProduction, definition) : definition.config,
    );
}

const createBundleFromDefinition = async (type, name, definition, repoPackages) => {
    let result;

    const bundleConfig = getWebpackConfig(type, name, definition, repoPackages);

    try {
        result = await runWebpack(type, name, bundleConfig);
        logger.log(`>>>> bundle (${type}.${name}) created in ${result.time} ms`);

        handleBundleOutput(type, definition, result, repoPackages);
    } catch (e) {
        throw new Error("Webpack compile failed ! " + e.message);
    }

    if (options.validate && result) {
        validateSize(type, name, result);
    }
};

const doBundle = async () => {
    logger.info(`>>> bundling packages (mode: production = ${isProduction})`);

    const { packages: repoPackages } = await getMatchingPackages({});
    const bundlers = [];

    Object.entries(config.bundles)
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
        process.exit(1);
    }
};

doBundle();
