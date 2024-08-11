#!/usr/bin/env node
import Yargs from "yargs";
import { glob } from "glob";
import { execa } from "execa";
import { logger } from "./utils.mjs";

const argv = Yargs(process.argv.slice(2))
    .parserConfiguration({
        //override duplicates instead of putting them in array
        "duplicate-arguments-array": false
    })
    .option("specs", {
        alias: "s",
        type: "string",
        description: "Glob pattern for specs files"
    })
    .option("threads", {
        alias: "t",
        type: "number",
        description: "Number of threads"
    })
    .option("command", {
        alias: "c",
        type: "string",
        description: "test command to run per thread"
    })
    .option("arguments", {
        alias: "a",
        type: "string",
        description: "arguments to pass to the test command",
    })
    .parse();
// .option('bail', { //bail is on by default
//     alias: 'b',
//     type: 'boolean',
//     description: 'Exit on first suite finishing with errors'
// })

console.log("ARGS ", argv)

const options = {
    specs: argv.specs,
    threads: argv.threads,
    command: argv.command,
    args: argv.arguments,
};

logger.info(">>> running E2E in Parallel", JSON.stringify(options));

const getSpecs = async () => {
//find specs files under cypress/integration folder
    const specs = await glob(options.specs);
    console.log("specs", specs);
    return specs;
};

const runGroupInThread = async (group, index, cancelSignal) => {
    const cmdStr = [
        `PRLL_THREAD_INDX=${index + 1} PRLL_GROUP_SIZE=${group.length}`,
        `${options.command}`,
        `--spec=${group.join(",")}`,
        `${options.args}`
    ].join(" ");

    logger.info(`about to run specs group: ${index} with command: ${cmdStr}`);

    const { failed, exitCode } = await execa({
        reject: false,
        shell: true,
        cancelSignal,
        stdio: "inherit",
        verbose: (line, { message, ...info }) => {
            if (["command", "output"].includes(info.type)) {
                logger.info(`[p:${index}] ${message}`);
            } else {
                logger.verbose(`[p:${index}] ${message}`);
            }
        }
    })`${cmdStr}`;

    logger.info(`finished running specs group ${index} (code: ${exitCode})`);

    return {
        index,
        success: !failed,
        exitCode,
    };
};

const runInParallel = async (specGroups) => {
    const aborter = new AbortController();
    const cancelSignal = aborter.signal;

    const runs = specGroups.map((group, index) => {
        return runGroupInThread(group, index, cancelSignal)
            .then((result) => {
                if (!result.success) {
                    logger.warn(`group ${index} failed! cancelling other runs...`);
                    //cancel all other runs in case of one failure (bail!)
                    aborter.abort();
                }

                return result;
            });
    });

    const results = await Promise.all(runs);

    results.forEach((res, index) => {
        console.log(`group ${index} finished with result: ${res.success} and exit code: ${res.exitCode}`)
    });

    return !results.find((res) => !res.success);
};

const getSpecsInGroups = (specs) => {
    const specGroups = [];
    const groupSize = Math.ceil(specs.length / options.threads);

    while (specs.length) {
        specGroups.push(specs.splice(0, groupSize));
    }

    return specGroups;
};

const runTests = async () => {
    const specs = await getSpecs();

    logger.info(`found ${specs.length} specs`);

    //divide the array of specs into arrays that match in count to options.threads:
    const specGroups = getSpecsInGroups(specs);

    const success = await runInParallel(specGroups);

    logger.info(`>>> finished! success = ${success}`);

    if (!success) {
        process.exit(1);
    }
}

runTests();
