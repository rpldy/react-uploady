#!/usr/bin/env node
const { execSync } = require("child_process")
const chalk = require("chalk");
    // shell = require("shelljs");

const shellCommand = (command) => {
    const result = { code: 0};

    try {
        execSync(command, { stdio: "inherit" });
    }
    catch (ex) {
        console.log(ex);
        result.code = 1;
    }

    return result;
};

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
    let result = shellCommand(`lerna version`);

    if (!result.code) {
        console.log(chalk.green(`___ *Lerna Version* finished successfully`));
        console.log(chalk.gray(`___ Running *Build & Bundle*`));
        result = shell.exec("yarn build; yarn bundle:prod;")

        if (!result.code) {
            console.log(chalk.green(`___ *Build & Bundle* finished successfully`));
            console.log(chalk.gray(`___ Running *Lerna Publish* with args: ${publishArgs}`));

            result = shellCommand(`lerna publish from-package ${publishArgs}`);
        } else {
            console.log(chalk.red(`*Build & Bundle* failed !!! (${result.code})`));
        }

    } else {
        console.log(chalk.red(`*Lerna Version* failed !!! (${result.code})`));
    }

    return process.exit(result.code);
};

release();
