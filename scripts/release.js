#!/usr/bin/env node
// const { execSync, execFileSync } = require("child_process")
const chalk = require("chalk"),
    shell = require("shelljs");

/**
 * release script separates lerna version and lerna publish
 * This way, versioning happens before build&bundle so these processes
 * can work with the packages' bumped version
 *
 */
const release = () => {
    const publishArgs = process.argv.slice(2)
        .join(" ");

    console.log(chalk.gray(`___ Running *Lerna Version*`));
    let result = shell.exec(`lerna version`, { stdio: "inherit" });

    if (!result.code) {
        console.log(chalk.green(`___ *Lerna Version* finished successfully`));
        console.log(chalk.gray(`___ Running *Build & Bundle*`));
        result = shell.exec("yarn build; yarn bundle:prod;")

        if (!result.code) {
            console.log(chalk.green(`___ *Build & Bundle* finished successfully`));
            console.log(chalk.gray(`___ Running *Lerna Publish* with args: ${publishArgs}`));

            result = shell.exec(`lerna publish from-package ${publishArgs}`, { stdio: "inherit" });
        } else {
            console.log(chalk.red(`*Build & Bundle* failed !!! (${result.code})`));
        }

    } else {
        console.log(chalk.red(`*Lerna Version* failed !!! (${result.code})`));
    }

    return process.exit(result.code);
};

release();
