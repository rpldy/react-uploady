/**
 * Suggests the next version and its changelog entry, based on the commits on the current branch
 * since the last stable release. Adds the entry at the top of CHANGELOG.md.
 *
 * Usage: node scripts/release/prepareRelease.mjs --bump <auto|patch|minor|major|prepatch|preminor|premajor|prerelease> [--preid <rc|alpha>]
 * Outputs JSON to stdout: { version, previousVersion, bump, entry }
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import semver from "semver";
import { getMatchingPackages } from "../lernaUtils.mjs";
import {
    parseCommit,
    isIgnoredCommit,
    getBumpType,
    createChangelogEntry,
    addEntryToChangelog,
} from "./changelogEntry.mjs";
import {
    createGit,
    getReleaseVersions,
    getPreviousVersion,
    getReleaseBase,
    getCommitsSince,
} from "./gitHistory.mjs";

const BUMPS = ["auto", "patch", "minor", "major", "prepatch", "preminor", "premajor", "prerelease"];
const CHANGELOG_PATH = "CHANGELOG.md";

const getPackages = () =>
    getMatchingPackages().map(({ name, location }) => ({
        name: name.replace(/^@rpldy\//, ""),
        dir: path.relative(process.cwd(), location) + "/",
    }));

const getNextVersion = (current, bump, preid, commits) => {
    const releaseType = bump === "auto" ? getBumpType(commits) : bump;
    const next = semver.inc(current, releaseType, preid);

    if (!next) {
        throw new Error(`failed to calculate next version from ${current} with ${releaseType} (preid: ${preid})`);
    }

    return { next, releaseType };
};

const validateArgs = ({ bump, preid }) => {
    if (!BUMPS.includes(bump)) {
        throw new Error(`invalid --bump value: "${bump}". Expected one of: ${BUMPS.join(", ")}`);
    }

    if (bump.startsWith("pre") !== !!preid) {
        throw new Error("--preid is required for pre-release bumps (and only for them)");
    }
};

const run = () => {
    const { values } = parseArgs({
        options: {
            bump: { type: "string", default: "auto" },
            preid: { type: "string" },
        },
    });

    validateArgs(values);

    const git = createGit();
    const releaseVersions = getReleaseVersions(git);
    const previousVersion = getPreviousVersion(JSON.parse(fs.readFileSync("lerna.json", "utf-8")).version, releaseVersions);
    const base = getReleaseBase(git, releaseVersions);

    const commits = getCommitsSince(git, base)
        .map(parseCommit)
        .filter((c) => !isIgnoredCommit(c));

    if (!commits.length) {
        throw new Error(`no changes found since last stable release (${base})`);
    }

    const { next, releaseType } = getNextVersion(previousVersion, values.bump, values.preid, commits);

    const entry = createChangelogEntry({
        version: next,
        //placeholder - the release workflow sets the actual publish date
        date: new Date().toISOString().slice(0, 10),
        commits,
        packages: getPackages(),
    });

    fs.writeFileSync(CHANGELOG_PATH, addEntryToChangelog(fs.readFileSync(CHANGELOG_PATH, "utf-8"), entry));

    console.error(`prepared ${next} (${releaseType}) from ${commits.length} commits since ${base}`);
    console.log(JSON.stringify({ version: next, previousVersion, bump: releaseType, entry }));
};

run();
