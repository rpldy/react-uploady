import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
    createGit,
    getReleaseVersions,
    getPreviousVersion,
    getReleaseBase,
    getCommitsSince,
} from "./gitHistory.mjs";

describe("gitHistory", () => {
    let dir, git;

    const commit = (message, file = "file.txt") => {
        fs.appendFileSync(path.join(dir, file), `${message}\n`);
        git("add", ".");
        git("commit", "-q", "-m", message);
    };

    beforeEach(() => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), "rpldy-release-"));
        git = createGit(dir);
        git("init", "-q", "-b", "master");
        git("config", "user.email", "test@test.com");
        git("config", "user.name", "test");
        git("config", "commit.gpgsign", "false");
        git("config", "tag.gpgsign", "false");
    });

    afterEach(() => {
        fs.rmSync(dir, { recursive: true, force: true });
    });

    it("should sort release tags by semver, ignoring non-version tags", () => {
        commit("feat: first");
        ["v1.12.0-rc.0", "v1.12.0", "v1.9.1", "v1.13.0", "not-a-version"]
            .forEach((tag) => git("tag", tag));

        expect(getReleaseVersions(git)).toEqual(["1.13.0", "1.12.0", "1.12.0-rc.0", "1.9.1"]);
    });

    it("should include commits merged to master while the previous release was in progress", () => {
        commit("feat: before release");
        git("switch", "-q", "-c", "release-1.0.0");
        commit("docs: changelog for v1.0.0", "CHANGELOG.md");
        git("tag", "v1.0.0");

        git("switch", "-q", "master");
        commit("fix: merged during release");
        commit("chore: release v1.0.0 (#10)", "CHANGELOG.md");
        commit("feat: after release");

        const versions = getReleaseVersions(git);
        const messages = getCommitsSince(git, getReleaseBase(git, versions)).map((c) => c.message.trim());

        expect(messages).toEqual([
            "fix: merged during release",
            "chore: release v1.0.0 (#10)",
            "feat: after release",
        ]);
    });

    it("should start from the last stable release, not a later pre-release", () => {
        commit("feat: in 1.0.0");
        git("tag", "v1.0.0");
        commit("feat: in rc");
        git("tag", "v1.1.0-rc.0");
        commit("fix: after rc");

        const messages = getCommitsSince(git, getReleaseBase(git, getReleaseVersions(git)))
            .map((c) => c.message.trim());

        expect(messages).toEqual(["feat: in rc", "fix: after rc"]);
    });

    it("should return changed files per commit", () => {
        commit("feat: first");
        git("tag", "v1.0.0");
        commit("fix: second", "a.js");

        expect(getCommitsSince(git, getReleaseBase(git, ["1.0.0"])))
            .toEqual([{ message: "fix: second", files: ["a.js"] }]);
    });

    it("should fail without a stable release tag", () => {
        expect(() => getReleaseBase(git, ["1.0.0-rc.0"])).toThrow("could not find a previous stable release tag");
    });

    describe("getPreviousVersion", () => {
        it("should return lerna version when it matches the latest tag", () => {
            expect(getPreviousVersion("1.13.0", ["1.13.0", "1.12.0"])).toBe("1.13.0");
        });

        it("should fail when lerna version is behind the latest tag (unmerged release PR)", () => {
            expect(() => getPreviousVersion("1.13.0", ["1.14.0-rc.0", "1.13.0"]))
                .toThrow("Merge the previous release PR first");
        });
    });
});
