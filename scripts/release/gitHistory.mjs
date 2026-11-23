import { execFileSync } from "node:child_process";
import semver from "semver";

export const createGit = (cwd = process.cwd()) =>
    (...args) => execFileSync("git", args, { cwd, encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });

/**
 * Release versions from the vX.Y.Z tags, highest first (semver order - git's v:refname puts rc above its release)
 */
export const getReleaseVersions = (git) =>
    git("tag", "--list", "v*")
        .split("\n")
        .map((tag) => semver.valid(tag))
        .filter(Boolean)
        .sort(semver.rcompare);

/**
 * The version to bump from. Fails when lerna.json on this branch is behind the latest release tag,
 * which means a previous release PR wasn't merged yet.
 */
export const getPreviousVersion = (lernaVersion, releaseVersions) => {
    const latest = releaseVersions[0];

    if (latest && latest !== lernaVersion) {
        throw new Error(`lerna.json version (${lernaVersion}) doesn't match the latest release tag (v${latest}). Merge the previous release PR first`);
    }

    return lernaVersion;
};

/**
 * Where the next release's commits start: the master commit the last stable release was branched from (or last merged).
 * Commits merged to master while that release was in progress come after it, so they're included in the next release.
 */
export const getReleaseBase = (git, releaseVersions) => {
    const lastStable = releaseVersions.find((v) => !semver.prerelease(v));

    if (!lastStable) {
        throw new Error("could not find a previous stable release tag (vX.Y.Z)");
    }

    return git("merge-base", `v${lastStable}`, "HEAD").trim();
};

/**
 * Commits on the current branch's first-parent line after base, oldest first
 */
export const getCommitsSince = (git, base) =>
    git("log", "--first-parent", "--reverse", "--format=%H%x1f%B%x1e", `${base}..HEAD`)
        .split("\x1e")
        .map((raw) => raw.trim())
        .filter(Boolean)
        .map((raw) => {
            const [sha, message] = raw.split("\x1f");
            const files = git("diff", "--name-only", `${sha}^`, sha).split("\n").filter(Boolean);
            return { message, files };
        });
