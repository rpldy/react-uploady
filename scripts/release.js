#!/usr/bin/env node
const { execSync } = require("child_process"),
    fs = require("fs"),
    yargs = require("yargs"),
    chalk = require("chalk"),
    MarkDownIt = require("markdown-it"),
    asyncReduce = require("async/reduce"),
    { parseGitRepo } = require("@lerna/github-client"),
    { createPullRequest } = require("octokit-plugin-create-pull-request"),
    createGitHubClient = require("./githubClient");

require("dotenv").config();

const { publishArgs = "", versionArgs = "", dry = false } = yargs.argv;

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

const log = (color, msg) =>
    console.log(color(`${msg} ${dry ? "\t--dry-run--" : ""}`));

const getLastCode = (results) => results.slice(-1)[0]?.code;

const getResult = (results, taskId) => {
    const isArray = Array.isArray(taskId);

    const find = (t) => results.find(({ id }) => id === t);

    const outputs = [].concat(taskId).map(find);

    return isArray ? outputs : outputs[0];
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
        id: "version",
        title: "Lerna Version",
        task: () => run(`lerna version ${versionArgs}`),
    },
    {
        id: "build",
        title: "Build & Bundle",
        task: () => run("yarn build; yarn bundle:prod;"),
    },
    {
        id: "publish",
        title: "Lerna Publish",
        task: () => run(`lerna publish from-package ${publishArgs}`),
    },
    {
        id: "changelog",
        title: "Extract ChangeLog",
        task: () => {
            const lernaJson = require("../lerna.json");
            const version = lernaJson.version;
            log(chalk.green, `Going to extract changes from log for version ${version}`);

            let versionLog;

            return new Promise((resolve) => {
                fs.readFile("./CHANGELOG.md", { encoding: "UTF-8" }, (err, data) => {
                    const md = new MarkDownIt();
                    const tokens = md.parse(data);

                    let startIndex = -1,
                        endIndex = undefined;

                    for (let i = 0; i < tokens.length; i++) {
                        if (!~startIndex && tokens[i].tag === "h2"
                            && tokens[i + 1]?.content.startsWith(version)) {
                            startIndex = i
                        } else if (!!~startIndex && tokens[i].tag === "h2" && tokens[i].type === "heading_open") {
                            endIndex = i - 1;
                            break;
                        }
                    }

                    if (!!~startIndex) {
                        const relevantTokens = tokens.slice(startIndex, (endIndex));

                        versionLog = relevantTokens.map((t) =>
                            (t.type === "heading_open" ? "\n" : "") +
                            (!["list_item_close", "heading_close", "bullet_list_open", "bullet_list_close"].includes(t.type) ? t.markup : "") +
                            (t.content && ` ${t.content}\n`) +
                            (t.type === "heading_close" ? "\n" : "")
                        ).join("");

                        log(chalk.gray, "___ Version Changelog ___\n\n" + versionLog + "\n\n");
                    }

                    resolve({ code: versionLog ? 0 : 1, versionLog, version });
                });
            });
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
                });

            const success = createRes?.status === 201;

            if (success) {
                log(chalk.green, `Successfully created new release at: \n ${createRes.data.url}`);
            }

            return { code: success ? 0 : createRes, repo };
        },
    },
    {
      id: "branch",
      title: "Create Release+Version Branch",
      task: async (results) => {
          const { version } = getResult(results, "changelog");
          const branch =`release-${version.replace(/\./g, "_")}`;

          let result = run(`git checkout -b ${branch}`);

          const isBranchAlreadyExists = !!result.code &&
              result.shellError.includes(`A branch named '${branch}' already exists`);

          if (!result.code || isBranchAlreadyExists) {
              if (isBranchAlreadyExists) {
                  log(chalk.gray, `branch ${branch} already exists`);
                  result = run(`git checkout ${branch}`);

                  if (!result.code) {
                      result = run(`git fetch origin`);
                  }
              }

              if (!result.code) {
                  log(chalk.gray, `pushing branch ${branch} to origin`);
                  result = run(`git push -u origin ${branch}`);

                  if (!result.code) {
                      log(chalk.gray, `returning to release branch`);
                      result = run(`git checkout release`);
                  }
              }
          }

          return { code: result.code, branch };
      },
    },
    {
        id: "pr",
        title: "Create Release+Version PR",
        task: async (results) => {
            const [{ version }, { repo }, { branch }] =
                getResult(results, ["changelog",  "gh-release", "branch"]);

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

            return { code: success ? 0 : prRes };
        }
    }
];

/**
 * release script separates lerna version and lerna publish
 * This way, versioning happens before build&bundle so these processes
 * can work with the packages' bumped version
 */
const release = async () => {
    log(chalk.white, `Running release flow with ${TASKS.length} tasks`);

    const results = await asyncReduce(TASKS, [], runTask);

    const lastCode = getLastCode(results);

    log(chalk.white, `Finished release flow with code: ${lastCode}`);

    return process.exit(lastCode);
};

release();
