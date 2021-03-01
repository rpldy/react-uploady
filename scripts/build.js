#!/usr/bin/env node
const chalk = require("chalk"),
	shell = require("shelljs"),
	{ getPackageName, copyFilesToPackage } = require("./utils");

const ENVS = ["esm", "cjs"];

const src = "src";

const ignored = [
    "**/*.story.js",
    "**/*.stories.js",
    "**/*.test.js",
    "**/types.js",
    "**/tests/**",
].join(",");

const runWithEnv = (pkgeName, env) => {
    console.log(chalk.bold(chalk.cyan(`___ building: ${pkgeName} ___ env = ${env}`)));

    const result = shell.exec(`BABEL_ENV="${env}" babel --root-mode upward ${src} -d lib/${env} --ignore ${ignored}`);

    if (result.code) {
        console.log(chalk.red(`BUILD ERROR!!! (${result.code}) (${env})`));
    } else {
        console.log(chalk.green(`___ finished building ${pkgeName} (${env}) ___`));
    }

    return result.code;
};

const build = () => {
	const pkgDir = process.cwd(),
		pkgeName = getPackageName(pkgDir),
        scriptsDir = __dirname;

    console.log(chalk.bold(chalk.cyan(`___ copying mandatory build files to: ${pkgeName} ___`)));

    copyFilesToPackage(scriptsDir, pkgDir, [
        "../.npmignore",
        "../LICENSE.md"
    ]);

    const exitCodes = ENVS.map((env) => runWithEnv(pkgeName, env));

    const failed = exitCodes.find(Boolean);

    return process.exit(failed);
};

build();
