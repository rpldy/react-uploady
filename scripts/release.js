#!/usr/bin/env node
const chalk = require("chalk"),
    shell = require("shelljs");

const release = () => {

    const publishArgs = process.argv.slice(2)
        .join(" ");

    console.log(chalk.gray(`___ Running Lerna Version`));
    let result = shell.exec(`lerna version`);

    if (!result.code) {
        console.log(chalk.green(`___ Lerna Version finished successfully`));
        console.log(chalk.gray(`___ Running Build & Bundle`));
        result = shell.exec("yarn build; yarn bundle:prod;")

        if (!result.code) {
            console.log(chalk.green(`___ Build & Bundle finished successfully`));
            console.log(chalk.gray(`___ Running Lerna Version with args: ${publishArgs}`));

            // result = shell.exec(`lerna publish from-package ${publishArgs}`)

        } else {
            console.log(chalk.red(`Build & Bundle failed !!! (${result.code})`));
        }

    } else {
        console.log(chalk.red(`Lerna Version Error !!! (${result.code})`));
    }

    return process.exit(result.code);
};


release();
