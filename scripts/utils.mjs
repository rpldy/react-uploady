// const fs = require("fs"),
//     path = require("path"),
//     fsExtra = !process.browser && require("fs-extra"),
//     chalk = require("chalk");

import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import chalk from "chalk";

const DEP_TYPES = {
    dependencies: "regular",
    devDependencies: "dev",
    peerDependencies: "peer",
};

const savePackageJson = async (pkgJson) => {
    let result;
    const file = path.resolve(pkgJson.location, "package.json");
    try {
        result = await fsExtra.writeJson(
            file,
            pkgJson.json,
            { spaces: 2 }
        )
    } catch (ex){
        console.log("failed to write to file: " + file)
        throw ex;
    }

    return result;
};

const getDepOfType = (pkgJson, depName, listName) => {
    const list = pkgJson.get(listName);
    const depVersion = list?.[depName];

    return depVersion ? {
        name: depName,
        version: depVersion,
        type: DEP_TYPES[listName],
        list,
    } : null;
};

const getPkgDependency = (pkgJson, depName) => {
    return getDepOfType(pkgJson, depName, "dependencies") ||
        getDepOfType(pkgJson, depName, "devDependencies") ||
        getDepOfType(pkgJson, depName, "peerDependencies");
};

const getPackageName = (dir) => {
    let name;

    const packagePath = path.resolve(dir, "package.json");
    if (fs.existsSync(packagePath)) {
        const json = fsExtra.readJsonSync(packagePath); //require(packagePath);
        name = json.name;
    } else {
        throw new Error("failed to get package name. package.json not found in " + dir);
    }

    return name;
};

const copyFilesToPackage = (dir, destination, files = []) => {
    files.forEach((file) => {
        const destFile = path.resolve(destination, path.basename(file));
        fs.copyFileSync(path.resolve(dir, file), destFile);
    });
};

const logger = {
    verbose: (...args) => console.log(chalk.gray(...args)),
    log: (...args) => console.log(chalk.white(...args)),
    info: (...args) => console.log(chalk.cyan(...args)),
    warn: (...args) => console.log(chalk.yellow(...args)),
    error: (...args) => console.log(chalk.red(...args)),
};

// module.exports = {
export {
    DEP_TYPES,
    logger,
    getPackageName,
    copyFilesToPackage,
    savePackageJson,
    getPkgDependency,
};
