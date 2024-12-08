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
    verbose: (msg, ...args) => console.debug(chalk.gray(msg), ...args),
    log: (msg, ...args) => console.log(chalk.white(msg), ...args),
    info: (msg, ...args) => console.log(chalk.cyan(msg), ...args),
    warn: (msg, ...args) => console.log(chalk.yellow(msg), ...args),
    error: (msg, ...args) => console.log(chalk.red(msg), ...args),
};

const FILESIZE_UNITS =  {
    "b": 1,
    "kb": 1024,
    "mb": 1024 * 1024,
    "gb": 1024 * 1024 * 1024
};

const FILE_SIZE_PARSE_RGX = /(\d+\.?\d*)\s*(\w+)/;

const parseFileSize = (sizeStr) => {
    const match = sizeStr.match(FILE_SIZE_PARSE_RGX);
    if (match) {
        const [_, val, unit] = match;
        return parseFloat(val) * FILESIZE_UNITS[unit.toLowerCase()];
    }

    return NaN;
};

export {
    DEP_TYPES,
    logger,
    getPackageName,
    copyFilesToPackage,
    savePackageJson,
    getPkgDependency,
    parseFileSize,
};
