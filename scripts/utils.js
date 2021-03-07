const fs = require("fs"),
    path = require("path"),
    chalk = require("chalk"),
    uploadyPkg = require("../packages/ui/uploady/package.json");

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

const getUploadyVersion = () => {
    return uploadyPkg.version;
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
    isDevDep,
    isPeerDep,
    getUploadyVersion,
};
