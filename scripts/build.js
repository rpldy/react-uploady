#!/usr/bin/env node
const chalk = require("chalk"),
	shell = require("shelljs"),
	{ getPackageName, copyFilesToPackage } = require("./utils"),
    uploadyPkg = require("../packages/ui/uploady/package.json");

const ENVS = ["esm", "cjs"];

const src = "src";

const ignored = [
    "**/*.story.js",
    "**/*.stories.js",
    "**/*.test.js",
    "**/types.js",
    "**/tests/**",
].join(",");

const runWithEnv = (pkgeName, env, uploadyVersion) => {
    console.log(chalk.bold(chalk.cyan(`___ building: ${pkgeName} ___ env = ${env}`)));

    const result = shell.exec(`BABEL_ENV="${env}" BUILD_TIME_VERSION="${uploadyVersion}" babel --root-mode upward ${src} -d lib/${env} --ignore ${ignored}`);

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

    const uploadyVersion = uploadyPkg.version;

    copyFilesToPackage(scriptsDir, pkgDir, [
        "../.npmignore",
        "../LICENSE.md"
    ]);

    const exitCodes = ENVS.map((env) => runWithEnv(pkgeName, env, uploadyVersion));

    const failed = exitCodes.find(Boolean);

    return process.exit(failed);
};

build();
