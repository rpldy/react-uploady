const chalk = require("chalk"),
	shell = require("shelljs"),
	{ getPackageName, copyFilesToPackage } = require("./utils");

const build = () => {
	const pkgDir = process.cwd(),
		pkgeName = getPackageName(pkgDir),
        scriptsDir = __dirname;

    console.log(chalk.bold(chalk.cyan(`___ copying files to: ${pkgeName} ___`)));
    copyFilesToPackage(scriptsDir, pkgDir, [
        "../.npmignore",
        "../LICENCE"
    ]);

	console.log(chalk.bold(chalk.cyan(`___ building: ${pkgeName} ___`)));

    const src = "src";

	const ignored = [
		"**/*.story.js",
		"**/*.stories.js",
		"**/*.test.js",
		"**/types.js",
        "**/tests/**",
	].join(",");

	const result = shell.exec(`babel --root-mode upward ${src} -d lib --ignore ${ignored}`);

	if (result.code) {
		console.log(chalk.red(`BUILD ERROR!!! (${result.code})`));
	} else {
		console.log(chalk.green(`___ finished building ${pkgeName} ___`));
	}
};

build();
