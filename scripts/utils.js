const fs = require("fs"),
	path = require("path"),
    { getFilteredPackages } = require("@lerna/filter-options"),
    { ListCommand } = require("@lerna/list");

class DepListCommand extends ListCommand {
    initialize() {

        this.result = new Promise((resolve) => {
            getFilteredPackages(this.packageGraph, this.execOpts, this.options)
                .then((packages) => {
                    resolve({
                        packages,
                        graph: this.packageGraph
                    });
                });
        });

        return Promise.resolve(false);
    }
}

const getMatchingPackages = async (argv) => {
    const cmd = new DepListCommand(argv);
    await cmd.runner;
    return await cmd.result;
};

const isDevDep = (pkgJson, depName) => {
    return !!~Object.keys(pkgJson.devDependencies).indexOf(depName);
};

const isPeerDep = (pgkJson, depName) => {
    return !!~Object.keys(pgkJson.peerDependencies).indexOf(depName);
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

module.exports = {
	getPackageName,
    copyFilesToPackage,
    getMatchingPackages,
    isDevDep,
    isPeerDep,
};
