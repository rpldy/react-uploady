const chalk = require("chalk"),
	shell = require("shelljs"),
	{ getPackageName } = require("./utils");

const build = () => {
	const currentDir = process.cwd(),
		packageName = getPackageName(currentDir);

	console.log(chalk.bold(chalk.cyan(`___ building: ${packageName} ___`)));

	const files = [
		"src",
	].join(" ");

	const ignored = [
		"**/*.story.js",
		"**/*.stories.js",
		"**/*.test.js",
		"**/types.js",
        "**/tests/**",
	].join(",");

	const result = shell.exec(`babel --root-mode upward ${files} -d lib --ignore ${ignored}`);

	if (result.code) {
		console.log(chalk.red(`BUILD ERROR!!! (${result.code})`));
	} else {
		console.log(chalk.green(`___ finished building ${packageName} ___`));
	}
};

build();
