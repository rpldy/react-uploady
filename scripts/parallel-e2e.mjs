#!/usr/bin/env node
import Yargs from "yargs";
import { glob } from "glob";
import { execa } from "execa";
import fsExtra from "fs-extra";
import { logger } from "./utils.mjs";

const argv = Yargs(process.argv.slice(2))
    .parserConfiguration({
        //override duplicates instead of putting them in array
        "duplicate-arguments-array": false
    })
    .option("pre", {
        alias: "p",
        type: "string",
        description: "command to run before starting the tests"
    })
    .option("specs", {
        alias: "s",
        type: "string",
        description: "glob pattern for specs files"
    })
    .option("threads", {
        alias: "t",
        type: "number",
        description: "number of threads / spec groups to run in parallel"
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
    .option("json-results", {
        type: "string",
        description: "glob pattern for finding json results files to base the weights on",
    })
    .option("weights-file", {
        type: "string",
        description: "file to store weights for the next run",
    })
    .option("ignore-weights-file", {
        type: "boolean",
        description: "ignore the weights file generated from previous runs (start from scratch)",
    })
    .parse();
// .option('bail', { //bail is on by default
//     alias: 'b',
//     type: 'boolean',
//     description: 'Exit on first suite finishing with errors'
// })

console.log("ARGS ", argv)

const options = {
    pre: argv.pre,
    specs: argv.specs,
    threads: argv.threads,
    command: argv.command,
    args: argv.arguments,
    resultFiles: argv.jsonResults,
    weightsPath: argv.weightsFile,
    ignore: argv.ignoreWeightsFile,
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
        `${options.pre ? `${options.pre} ` : ""}`,
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

    if (!options.ignore && options.weightsPath) {
        let weightsJson;
        try {
            weightsJson = fsExtra.readJsonSync(options.weightsPath);
            logger.info(`using weights file (${options.weightsPath}) to split specs into groups`);
        } catch (ex) {
            logger.info(`failed to load weights file from ${options.weightsPath}`, ex);
        }

        if (weightsJson) {
            if (weightsJson.threads === options.threads) {
                //use groups from weights file but also make sure to add specs that arent listed (probably new specs)
                weightsJson.groups.forEach((group) => {
                    specGroups.push(group);
                });

                //find new specs that arent in the weights file
                const newSpecs = specs.filter((spec) => {
                    return !weightsJson.groups.find((group) => group.includes(spec));
                });

                logger.verbose("found specs that arent in the weights file", newSpecs);

                //add new specs to the groups
                let lastGroup = 0;
                while (newSpecs.length) {
                    specGroups[lastGroup].push(newSpecs.shift());
                    //increase or circle back to the first group
                    lastGroup = (lastGroup + 1) % specGroups.length;
                }
            } else {
                logger.info(`ignoring weights file because threads count doesnt match: ${weightsJson.threads} != ${options.threads}`)
            }
        }
    }

    if (!specGroups.length) {
        const groupSize = Math.ceil(specs.length / options.threads);
        logger.info(`weights file not used. splitting specs into ${options.threads} groups of size: ${groupSize}`);

        while (specs.length) {
            specGroups.push(specs.splice(0, groupSize));
        }
    }

    logger.verbose("returning spec groups", specGroups)
    return specGroups;
};

const insertSortedByDuration = (arr, file, duration, data) => {
    let i = 0;
    while (i < arr.length && arr[i].duration > duration) {
        i++;
    }

    arr.splice(i, 0, { file, duration, ...data });
}

const createWeightsFile = async () => {
    if (options.weightsPath) {
        const results = await glob(options.resultFiles);

        const { threads } = options;

        const weights = {
            threads,
            files: 0,
            total: 0,
            passed: 0,
            failed: 0,
            sortedFiles: [],
            groups: [],
        };

        //sort specs by their duration and collected some metadata
        results.forEach((resultPath) => {
            const resultJson = fsExtra.readJsonSync(resultPath);
            console.log(`read results json file: ${resultPath}`, resultJson.stats);

            weights.files += 1;
            weights.total += resultJson.stats.tests;
            weights.passed += resultJson.stats.passes;
            weights.failed += resultJson.stats.failures;

            const { file } = resultJson.results[0];
            const { duration } = resultJson.stats;

            insertSortedByDuration(weights.sortedFiles, file, duration, { tests: resultJson.stats.tests });
        });

        const sorted = weights.sortedFiles.slice(0);

        let lastGroup = 0;
        while (sorted.length) {
            weights.groups[lastGroup] = weights.groups[lastGroup] || [];
            weights.groups[lastGroup].push(sorted.shift().file);

            //increase or circle back to the first group
            lastGroup = (lastGroup + 1) % threads;
        }

        fsExtra.writeJsonSync(options.weightsPath, weights, { spaces: 2 });
    } else {
        logger.warn("weights file not provided, skipping creation");
    }
};

const runTests = async () => {
    const specs = await getSpecs();

    logger.info(`found ${specs.length} specs`);

    //divide the array of specs into arrays that match in count to options.threads:
    const specGroups = getSpecsInGroups(specs);
    const success = await runInParallel(specGroups);

    logger.info(`>>> finished! (success=${success})`);

    if (!success) {
        process.exit(1);
    } else {
        try {
            await createWeightsFile();
        } catch (ex) {
            logger.error("failed to create weights file", ex);
        }
    }
}

runTests();
