const fs = require("fs"),
    path = require("path"),
    chalk = require("chalk"),
    { getFilteredPackages } = require("@lerna/filter-options"),
    { ListCommand } = require("@lerna/list");

class DepListCommand extends ListCommand {
    initialize() {
        this.result = new Promise((resolve) => {
            //replace the underlying List command result with objects (and not a string)
            getFilteredPackages(this.packageGraph, this.execOpts, this.options)
                .then((packages) => {
                    resolve({
                        packages,
                        graph: this.packageGraph
                    });
                });
        });

        //stop the underlying List command from executing
        return Promise.resolve(false);
    }
}

const getMatchingPackages = async (argv) => {
    const cmd = new DepListCommand(argv);
    await cmd.runner;
    return await cmd.result;
};

const isDevDep = (pkgJson, depName) => {
    return !!(pkgJson.devDependencies && pkgJson.devDependencies[depName]);
};

const isPeerDep = (pgkJson, depName) => {
    return !!(pgkJson.peerDependencies && pgkJson.peerDependencies[depName]);
};

const getPackageName = (dir) => {
    let name;

    const packagePath = path.resolve(dir, "package.json");
    if (fs.existsSync(packagePath)) {
        const json = require(packagePath);
        name = json.name;
    } else {
        throw new Error("failed to get package name. package.json not found in " + dir);
    }

    return name;
};

const copyFilesToPackage = (currentDir, destination, files = []) => {

    files.forEach((file) => {
        const destFile = path.resolve(destination, path.basename(file));
        fs.copyFileSync(path.resolve(currentDir, file), destFile);
    });
};

const logger = {
    verbose: (...args) => console.log(chalk.gray(...args)),
    log: (...args) => console.log(chalk.white(...args)),
    info: (...args) => console.log(chalk.cyan(...args)),
    warn: (...args) => console.log(chalk.yellow(...args)),
    error: (...args) => console.log(chalk.red(...args)),
};

module.exports = {
    logger,
    getPackageName,
    copyFilesToPackage,
    getMatchingPackages,
    isDevDep,
    isPeerDep,
};
