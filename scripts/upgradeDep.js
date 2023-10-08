#!/usr/bin/env node
const yargs = require("yargs"),
    pacote = require("pacote"),
    semverUtils = require("semver-utils"),
    shell = require("shelljs"),
    { getMatchingPackages } = require("./lernaUtils"),
    { logger, savePackageJson, getPkgDependency } = require("./utils");

const argv = yargs.argv;

//TODO - ONLY SUPPORTS ONE DEP AT A TIME...

const options = {
    dep: argv._[0],
    latest: argv.latest,
    exact: argv.exact,
    tilde: argv.tilde,
    //also accepts --scope which is passed as is to the lerna list command
};

logger.info(">>> upgrading dependency in packages");

const getDependencyWithVersion = () => {
    const { dep, latest } = options;
    const fullName = dep.split("@").filter(Boolean);

    let name, version;

    if (fullName.length > 1) {
        version = fullName[fullName.length - 1];
        name = fullName[fullName.length - 2];
    }

    name = name || fullName[0];
    name = dep.startsWith("@") ? `@${name}` : name;

    version = latest ? "latest" : (version || "");

    const semver = semverUtils.parseRange(version);

    if (semver.length > 1) {
        throw new Error(`multiple part semver not supported - ${version}`);
    }

    return {
        name,
        version,
        full: `${name}@${version}`,
        operator: semver.length ? semver[0].operator : null,
    };
};

const doPackageUpgrade = (pkg, exactDep) => {
    const dep = getPkgDependency(pkg, exactDep.name)

    let result;

    if (dep) {
        logger.verbose(`>>>> found package [${pkg.name}] with dependency: ${dep.name}(type:${dep.type}) - setting version to: ${exactDep.upgradeVersion}`);

        dep.list[dep.name] = exactDep.upgradeVersion;
        result = savePackageJson(pkg);
    }

    return result;
};

const getValidUpgradeVersion = async (exactDep) => {
    let result = null;

    try {
        const manifest = await pacote.manifest(exactDep.full);
        logger.info(`>>>> found package manifest [${manifest.name}] version: ${manifest.version}`);

        result = manifest.version;
    } catch (ex) {
    }

    return result;
};

const upgradeDep = async () => {
    const packages = getMatchingPackages();
    const exactDep = getDependencyWithVersion();

    if (packages.length) {
        const upgradeVersion = await getValidUpgradeVersion(exactDep);
        // console.log("!!!!! ", {exactDep, upgradeVersion, semver: exactDep.semver});

        if (upgradeVersion) {
            const prefix = (!exactDep.operator && !options.exact) ? (options.tilde ? "~" : "^") : "";

            exactDep.upgradeVersion = `${prefix}${exactDep.operator ? exactDep.version : upgradeVersion}`;

            const writes = [];

            packages.forEach((pkg) => {
                const writePromise = doPackageUpgrade(pkg, exactDep);

                if (writePromise) {
                    writes.push(writePromise);
                }
            });

            if (writes.length) {
                await Promise.all(writes);
                logger.info(`>>>> finished updating ${writes.length} packages`);
                shell.exec("lerna exec --stream -- yarn");
            } else {
                logger.error(`!!! no packages found that use ${exactDep.name}`);
            }
        } else {
            logger.error(`${exactDep.full} cannot be found on npm!`);
        }
    }
};

upgradeDep();
