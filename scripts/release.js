#!/usr/bin/env node
const { execSync } = require("child_process"),
    fs = require("fs"),
    yargs = require("yargs"),
    chalk = require("chalk"),
    MarkDownIt = require("markdown-it"),
    asyncReduce = require("async/reduce"),
    { parseGitRepo } = require("@lerna/github-client"),
    { createPullRequest } = require("octokit-plugin-create-pull-request"),
    createGitHubClient = require("./githubClient"),
    {  extractChangelogNotesForCurrentVersion } = require("./extractChangeLogNotes");

require("dotenv").config();

const { publishArgs = "", versionArgs = "", dry = false, from = null } = yargs.argv;

const effectiveVersionArgs = Array.isArray(versionArgs) ? versionArgs.join(" ") : versionArgs;
const effectivePublishArgs = Array.isArray(publishArgs) ? publishArgs.join(" ") : publishArgs;

const getSuccessResult = () => ({ code: 0 });

const shellCommand = (command) => {
    const result = getSuccessResult();

    try {
        execSync(command, { stdio: [0, 1, "pipe"] }); //"inherit" });
    } catch (ex) {
        console.log(ex);
        console.log("status = ", ex.status)
        result.code = ex.status || 1;
        result.shellError = ex.stderr.toString();
    }

    return result;
};

const run = (command) =>
    !dry ? shellCommand(command) : getSuccessResult();

const getIsPre = (argsStr) => argsStr.includes("dist-tag");

const IS_PRE = getIsPre(effectivePublishArgs) || getIsPre(effectiveVersionArgs);

const log = (color, msg) =>
    console.log(color(`${msg} ${dry ? "\t--dry-run--" : ""}`));

const getLastCode = (results) => results.slice(-1)[0]?.code;

const getResult = (results, ...taskId) => {
    const find = (t) => results.find(({ id }) => id === t);

    const outputs = [].concat(taskId).map(find);

    return taskId.length > 1 ? outputs : outputs[0];
}

const runTask = async (results, { id, title, task }) => {
    let result;

    if (!results.length || !getLastCode(results)) {
        log(chalk.gray, `** Running *${title}*`);

        try {
            result = await task(results);
        } catch (ex) {
            result = { code: ex.message };
        }

        if (result.code) {
            log(chalk.red, `*${title}* failed !!! (${result.code})`);
        } else {
            log(chalk.green, `*${title}* finished successfully`);
        }
    } else {
        log(chalk.yellow, `-- skipping *${title}* due to previous failures`);
        result = { code: "skipped!" };
    }

    return results.concat({ id, ...result });
};

const TASKS = [
    {
      id: "merge master",
      title: "Merge changes from master branch",
      task: () => {
          let result = run(`git fetch origin`);

          if (!result.code) {
              log(chalk.gray, `merging master to release branch`);
              result = run(`git merge master -m "chore: merge content from master"`);
          }

          return { code: result.code };
      },
    },
    {
        id: "version",
        title: "Lerna Version",
        task: () => run(`lerna version ${effectiveVersionArgs}`),
    },
    {
        id: "build",
        title: "Build & Bundle",
        task: () => run("yarn build; yarn bundle:prod;"),
    },
    {
        id: "publish",
        title: "Lerna Publish",
        task: () => run(`lerna publish from-package ${effectivePublishArgs}`),
    },
    {
        id: "changelog",
        title: "Extract ChangeLog",
        task: async () => {
            // const lernaJson = require("../lerna.json");
            // const version = lernaJson.version;
            // log(chalk.green, `Going to extract changes from log for version ${version}`);

            // let versionLog;

            // return new Promise((resolve) => {
            //     fs.readFile("./CHANGELOG.md", { encoding: "UTF-8" }, (err, data) => {
            //         const md = new MarkDownIt();
            //         const tokens = md.parse(data);
            //
            //         let startIndex = -1,
            //             endIndex = undefined;
            //
            //         for (let i = 0; i < tokens.length; i++) {
            //             if (!~startIndex && tokens[i].tag === "h2"
            //                 && tokens[i + 1]?.content.startsWith(version)) {
            //                 startIndex = i
            //             } else if (!!~startIndex && tokens[i].tag === "h2" && tokens[i].type === "heading_open") {
            //                 endIndex = i - 1;
            //                 break;
            //             }
            //         }
            //
            //         if (!!~startIndex) {
            //             const relevantTokens = tokens.slice(startIndex, (endIndex));
            //
            //             versionLog = relevantTokens.map((t) =>
            //                 (t.type === "heading_open" ? "\n" : "") +
            //                 (!["list_item_close", "heading_close", "bullet_list_open", "bullet_list_close"].includes(t.type) ? t.markup : "") +
            //                 (t.content && ` ${t.content}\n`) +
            //                 (t.type === "heading_close" ? "\n" : "")
            //             ).join("");
            //
            //             log(chalk.gray, "___ Version Changelog ___\n\n" + versionLog + "\n\n");
            //         }
            //
            //         resolve({ code: versionLog ? 0 : 1, versionLog, version });
            //     });
            // });
            const { version, versionLog } = await extractChangelogNotesForCurrentVersion();

            return { code: versionLog ? 0 : 1, versionLog, version }
        },
    },
    {
        id: "gh-release",
        title: "Create Github Release",
        task: async (results) => {
            const { versionLog, version } = getResult(results, "changelog");
            const repo = parseGitRepo();
            const tag = `v${version}`

            log(chalk.gray, `Creating GH Release for ${tag} on ${repo.full_name}`);

            const ghClient = createGitHubClient();

            const createRes = dry ?
                {
                    status: 201,
                    data: { url: "dry-run/release" }
                } :
                await ghClient.repos.createRelease({
                    owner: repo.owner,
                    repo: repo.name,
                    tag_name: tag,
                    name: tag,
                    body: versionLog,
                    draft: false,
                    prerelease: IS_PRE,
                });

            const success = createRes?.status === 201;

            if (success) {
                log(chalk.green, `Successfully created new release at: \n ${createRes.data.url}`);
            }

            return { code: success ? 0 : createRes, repo };
        },
    },
    {
        id: "pr",
        title: "Create Release+Version PR",
        task: async (results) => {
            const [{ version }, { repo }] =
                getResult(results, "changelog",  "gh-release");

            const branch =`release-${version.replace(/\./g, "_")}`;

            const ghClient = createGitHubClient({}, [
                createPullRequest
            ]);

            log(chalk.gray, `Creating Release PR for v${version}`);

            const prRes = dry ?
                {
                    status: 201,
                    data: { url: "dry-run/pr" }
                } :
                await ghClient.createPullRequest({
                owner: repo.owner,
                repo: repo.name,
                title: `chore: release v${version}`,
                base: "master",
                head:  branch,
                changes: [{
                    files: {},
                    commit: "commit new version"
                }]
            });

            const success = prRes?.status === 201;

            if (success) {
                log(chalk.green, `Successfully created pull-request at: \n ${prRes.data.url}`);
            }

            return { code: success ? 0 : prRes, branch, };
        }
    },
    {
        id: "branch",
        title: "Push changes to Release+Version Branch",
        task: async (results) => {
            const [{ version }, { branch }] = getResult(results, "changelog", "pr");

            let result = run(`git fetch origin`);

            if (!result.code) {
                result = run(`git checkout -b ${branch} origin/${branch}`);

                if (!result.code) { //now in release-version branch
                    log(chalk.gray, `merging release to ${branch}`);
                    result = run(`git merge release -m "chore: merge content for release ${version}\n" --log`);

                    if (!result.code) {
                        log(chalk.gray, `pushing branch ${branch} to origin`);
                        result = run(`git push origin`);
                    }

                    log(chalk.gray, `returning to release branch`);
                    result = run(`git checkout release`);
                }
            }

            return { code: result.code };
        },
    },
];

const getTasksFrom = (tasks, from) => {
    log(chalk.white, `filtering tasks to start from: '${from}'`);
    const index = tasks.findIndex(({ id }) => id === from );
    return tasks.slice(index);
};

/**
 * release script separates lerna version and lerna publish
 * This way, versioning happens before build&bundle so these processes
 * can work with the packages' bumped version
 */
const release = async () => {
    const preRelease = IS_PRE ? "PRE-" : "";

    const tasks = from ? getTasksFrom(TASKS, from) : TASKS;

    log(chalk.white, `Running ${preRelease}release flow with ${tasks.length} tasks`);

    const results = await asyncReduce(tasks, [], runTask);
    const lastCode = getLastCode(results);

    log(chalk.white, `Finished ${preRelease}release flow with code: ${lastCode}`);

    return process.exit(lastCode);
};

release();
