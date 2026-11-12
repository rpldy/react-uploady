/**
 * Suggests the next version and its changelog entry, based on the commits on the current branch
 * since the last stable release. Adds the entry at the top of CHANGELOG.md.
 *
 * Usage: node scripts/release/prepareRelease.mjs --bump <auto|patch|minor|major|prepatch|preminor|premajor|prerelease> [--preid <rc|alpha>]
 * Outputs JSON to stdout: { version, previousVersion, bump, entry }
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
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

const BUMPS = ["auto", "patch", "minor", "major", "prepatch", "preminor", "premajor", "prerelease"];
const STABLE_RELEASE_RX = /^chore: release v\d+\.\d+\.\d+(\s|$)/;
const CHANGELOG_PATH = "CHANGELOG.md";

const git = (...args) => execFileSync("git", args, { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });

const getLastStableReleaseCommit = () => {
    const found = git("log", "--first-parent", "--format=%H %s")
        .split("\n")
        .find((line) => STABLE_RELEASE_RX.test(line.slice(41)));

    if (!found) {
        throw new Error("could not find a previous stable release commit (chore: release vX.Y.Z)");
    }

    return found.slice(0, 40);
};

const getCommitsSince = (base) =>
    git("log", "--first-parent", "--reverse", "--format=%H%x1f%B%x1e", `${base}..HEAD`)
        .split("\x1e")
        .map((raw) => raw.trim())
        .filter(Boolean)
        .map((raw) => {
            const [sha, message] = raw.split("\x1f");
            const files = git("diff", "--name-only", `${sha}^`, sha).split("\n").filter(Boolean);
            return parseCommit({ message, files });
        });

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

    const previousVersion = JSON.parse(fs.readFileSync("lerna.json", "utf-8")).version;
    const base = getLastStableReleaseCommit();
    const commits = getCommitsSince(base).filter((c) => !isIgnoredCommit(c));

    if (!commits.length) {
        throw new Error(`no changes found since last stable release (${base})`);
    }

    const { next, releaseType } = getNextVersion(previousVersion, values.bump, values.preid, commits);

    const entry = createChangelogEntry({
        version: next,
        date: new Date().toISOString().slice(0, 10),
        commits,
        packages: getPackages(),
    });

    fs.writeFileSync(CHANGELOG_PATH, addEntryToChangelog(fs.readFileSync(CHANGELOG_PATH, "utf-8"), entry));

    console.error(`prepared ${next} (${releaseType}) from ${commits.length} commits since ${base}`);
    console.log(JSON.stringify({ version: next, previousVersion, bump: releaseType, entry }));
};

run();
