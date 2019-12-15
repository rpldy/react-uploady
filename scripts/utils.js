const fs = require("fs"),
	path = require("path");

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

module.exports = {
	getPackageName,
};