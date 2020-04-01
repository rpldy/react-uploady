#!/usr/bin/env node
const yargs = require("yargs"),
    chalk = require("chalk"),
    pacote = require("pacote"),
    shell = require("shelljs"),
    { getMatchingPackages, isDevDep, isPeerDep } = require("./utils");

const argv = yargs.argv;

const options = {
    dep: argv._[0],
    latest: argv.latest,
    exact: argv.exact,
    tilde: argv.tilde,
};

console.log(">>> upgrading dependency in packages");

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

    return {
        name,
        version,
        full: `${name}@${version}`
    };
};

const doPackageUpgrade = (pkg, exactDep, graph) => {
    const graphEntry = graph.get(pkg.name),
        pkgDep = graphEntry.externalDependencies.get(exactDep.name);

    let result;

    if (pkgDep) {
        console.log(chalk.white(`>>>> found package [${pkg.name}] with dependency: ${pkgDep.raw} - setting version to: ${exactDep.upgradeVersion}`));

        const pkgJson = graphEntry.pkg;

        const depsList = isDevDep(pkgJson, exactDep.name) ?
            pkgJson.devDependencies :
            isPeerDep(pkgJson, exactDep.name) ?
                pkgJson.peerDependencies :
                pkgJson.dependencies;

        depsList[exactDep.name] = exactDep.upgradeVersion;
        result = pkg.serialize(); //returns a promise
    }

    return result;
};

const getValidUpgradeVersion = async (exactDep) => {
    let result = null;

    try {
        const manifest = await pacote.manifest(exactDep.full);
        console.log(chalk.green(`>>>> found package manifest [${manifest.name}] version: ${manifest.version}`));

        result = manifest.version;
    } catch (ex) {
    }

    return result;
};

const upgradeDep = async () => {
    const { packages, graph } = await getMatchingPackages(argv);
    const exactDep = getDependencyWithVersion();

    if (packages.length) {
        const upgradeVersion = await getValidUpgradeVersion(exactDep);

        if (upgradeVersion) {
            const prefix = !options.exact ? (options.tilde ? "~" : "^") : "";

            exactDep.upgradeVersion = `${prefix}${upgradeVersion}`;

            const writes = [];

            packages.forEach((pkg) => {
                const writePromise = doPackageUpgrade(pkg, exactDep, graph);

                if (writePromise) {
                    writes.push(writePromise);
                }
            });

            if (writes.length) {
                await Promise.all(writes);
                console.log(chalk.cyan(`>>>> finished updating packages - bootstraping`));
                shell.exec("yarn bootstrap");
            } else {
                console.log(chalk.red(`!!! no packages found that use ${exactDep.name}`));
            }

        } else {
            console.log(chalk.red(`${exactDep.full} cannot be found on npm!`));
        }
    }
};

upgradeDep();


// const scopes = getPackagesScopes(packages, exactDep, graph);
//
// if (scopes.length) {
//     runUpgradeCommand(scopes, exactDep);
// } else {
//     console.log(chalk.red(`!!! no packages found that use ${exactDep.name}`));
// }
// const scopesFlag = scopes.map((s) => `--scope ${s}`).join(" ");
//
//
// const command = `lerna exec --concurrency 1 ${scopesFlag} yarn upgrade ${upgradeArgs.join(" ")}`;
//
// const cmdArgs = [
//     `--scope=${pkg.name}`,
//     `${exactDep.name}@${exactDep.version}`,
//     `${options.exact ? "--exact" : ""}`,
//     `${isDevDep(graphEntry.pkg, exactDep.name) ? "--dev" : ""}`,
//     `${isPeerDep(graphEntry.pkg, exactDep.name) ? "--peer" : ""}`,
// ];
//
// const command = `lerna add ${cmdArgs.join(" ")}`;
//
// if (options.dryrun) {
//     console.log("[dryrun]: shell command: ", command);
// } else {
//     const result = shell.exec(command);
//
//     if (result.code) {
//         console.log(chalk.red(`upgrade failed ! (${result.code})`));
//     }
// }
//         const command = `lerna exec yarn upgrade ${addArgs.join(" ")}`;
// const getPackagesScopes = (packages, exactDep, graph) => {
//     return packages.reduce((res, pkg) => {
//         const graphEntry = graph.get(pkg.name),
//             pkgDep = graphEntry.externalDependencies.get(exactDep.name);
//
//         if (pkgDep) {
//             console.log(chalk.cyan(`>>>> found package [${pkg.name}] with dependency: ${pkgDep.raw}`));
//             res.push(pkg.name);
//         }
//
//         return res;
//     }, []);
// };
