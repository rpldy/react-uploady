#!/usr/bin/env node
import path from "path";
import fs from "fs-extra";
import webpack from "webpack";
import Yargs from "yargs";
import shell from "shelljs";
import bytes from "bytes";
import _ from "lodash";
import { mergeWithCustomize as wpMerge, customizeArray } from "webpack-merge";
import { getMatchingPackages } from "./lernaUtils.mjs";
import { logger } from "./utils.mjs"
//TODO: should be passed by options or found in root (dynamically)
import config from "../bundle.config.mjs";
import outputBundleSize from "./reportBundleSizeToGithub.mjs";

const yargs = Yargs(process.argv.slice(2));

const options = {
    validate: yargs.argv.validate,
    outputPath: yargs.argv.out,
    bundle: yargs.argv.bundle,
    debugBundleSize: yargs.argv.debugSize,
};

const isProduction = process.env.NODE_ENV === "production";
const isCI = !!process.env.CI;

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

const isExcluded = (entry, exclude) => {
    const pkgPath = _.isString(entry) ? entry : entry.location;
    return !!exclude.find((e) => !!~pkgPath.indexOf(e));
};

const getEntriesFromDefinition = ({ pkgs, exclude }, type, repoPackages) => {
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

    return _.flatten(entries)
        .filter((p) => !exclude || !isExcluded(p, exclude))
        .map((entry) => (!_.isString(entry) || entry.startsWith("./")) ? entry : `./${entry}`);
};

const validateSize = (type, name, wpResult, bundleSizes) => {
    const maxSize = _.get(config.bundles, [type, name, "maxSize"]);

    if (isProduction && maxSize) {
        const mainAssetNamePrefix = `${config.library}-${name}.${type}`;
        const mainAsset = wpResult.assets.find((a) => a.name.startsWith(mainAssetNamePrefix));
        const outputFile = path.join(wpResult.outputPath, mainAsset.name);

        const result = shell.exec(`bundlesize -f ${outputFile} -s ${maxSize} ${options.debugBundleSize ? "--debug" : ""}`);

        if (result.code && !isCI) {
            //on CI we dont fail so the report is printed in GH and then the action should fail the flow
            throw new Error(`bundle: ${outputFile} exceeds allowed maxSize: ${bytes(maxSize)}`)
        }

        const gzipSize = result.stdout.split(": ")[1]?.split(` ${result.code ? ">" : "<"}`)[0];

        bundleSizes.push({ name, size: gzipSize, max: maxSize, success: !result.code });
    }
};

const runWebpack = (type, name, config) => {
    return new Promise((resolve, reject) => {
        try {
            webpack(config,
                (err, stats) => {
                    const info = stats?.toJson();

                    if (err || stats.hasErrors()) {
                        err = err || info?.errors;
                        logger.error(`!!! failed to compile bundle: ${name} (type: ${type})`, JSON.stringify(err));
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

const copyBundleToTarget = (assets, outputPath, type, pkgRoot, dontUsePolyfills) => {
    const dest = path.join(pkgRoot, "lib", config.targets[type]);
    fs.ensureDirSync(dest);

    assets.forEach((asset) => {
        const outputFile = path.join(outputPath, asset.name);
        fs.copyFileSync(outputFile, path.join(dest, path.basename(outputFile)));

        if (!dontUsePolyfills || !~asset.name.indexOf("polyfills")) {
            fs.copyFileSync(outputFile, path.join(outputFile, "/../../", path.basename(outputFile)));
        }
    });

    fs.rm(outputPath, { recursive: true });
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
                    copyBundleToTarget(assets, outputPath, type, pkg.location, definition.dontUsePolyfills);
                } else {
                    throw new Error(`Didn't find matching bundle for package: ${pkg.name} - bundle: ${bundleFileName}`);
                }
            });
        } else {
            const pkgRoot = getPackageRootFromName(definition.target, repoPackages);
            copyBundleToTarget(wpResult.assets, outputPath, type, pkgRoot, definition.dontUsePolyfills);
        }
    }
};

const getWebpackConfig = (type, name, definition, repoPackages) => {
    const entries = getEntriesFromDefinition(definition, type, repoPackages);

    const outputPath = path.join(process.cwd(), `${options.outputPath || "bundle"}/${name}`);

    logger.verbose(`>>>> creating bundle: '${name}' of type: '${type}' - with entries: ${entries.length} - at: ${outputPath}`);

    //Must set this here for babel to pick up and replace inline variable (see in babel config)
    process.env.BUILD_TIME_VERSION = config.version;

    return wpMerge({
        customizeArray: customizeArray({
            "plugins": "append",
        }),
    })(
        config.webpackConfig.base,
        config.webpackConfig[process.env.NODE_ENV] || {},
        {
            entry: Array.isArray(definition.pkgs) ? {
                [_.camelCase(name)]: entries
            } : undefined,

            output: {
                path: outputPath,
                filename: `${config.fileNamePrefix || config.library}-${name}.${type}${isProduction ? ".min" : ""}.js`,
                library: config.library,
                libraryTarget: type,
                // globalObject: "this",
            },
        },
        _.isFunction(definition.config) ?
            definition.config(entries, isProduction, definition) :
            (definition.config || {}),
    );
}

const createBundleFromDefinition = async (type, name, definition, repoPackages, bundleSizes) => {
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
        validateSize(type, name, wpResult, bundleSizes);
    }
};

const doBundle = async () => {
    logger.info(`>>> bundling packages (mode: production = ${isProduction})`);

    const repoPackages = getMatchingPackages();
    const bundlers = [];
    const bundleSizes = [];

    if (options.bundle) {
        //only bundle the definition requested by argument
        const parts = options.bundle.split("."),
            definition = _.get(config.bundles, parts);

        bundlers.push(createBundleFromDefinition(parts[0], parts[1], definition, repoPackages, bundleSizes));
    } else {
        //bundle all definitions in config
        Object.entries(config.bundles)
            .forEach(([type, bundle]) => {
                Object.entries(bundle)
                    .forEach(([name, definition]) => {
                        bundlers.push(
                            createBundleFromDefinition(type, name, definition, repoPackages, bundleSizes)
                        );
                    });
            });
    }

    try {
        logger.verbose(`>>> waiting for ${bundlers.length} bundles to compile`);
        await Promise.all(bundlers);
        logger.info(`>>> Finished bundling successfully!`);

        if (isCI) {
            await outputBundleSize(bundleSizes);
        }
    } catch (e) {
        logger.error(`!!!! Failed to bundle`, e);
        process.exit(1);
    }
};

doBundle();
