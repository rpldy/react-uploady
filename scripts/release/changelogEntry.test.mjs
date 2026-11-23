import {
    parseCommit,
    isIgnoredCommit,
    getBumpType,
    getLabel,
    createChangelogEntry,
    addEntryToChangelog,
} from "./changelogEntry.mjs";

const PACKAGES = [
    { name: "chunked-sender", dir: "packages/core/chunked-sender/" },
    { name: "tus-sender", dir: "packages/core/tus-sender/" },
    { name: "uploader", dir: "packages/core/uploader/" },
    { name: "uploady", dir: "packages/ui/uploady/" },
    { name: "upload-button", dir: "packages/ui/upload-button/" },
];

const commit = (message, files = []) => parseCommit({ message, files });

describe("changelogEntry", () => {
    describe("parseCommit", () => {
        it("should parse conventional header and strip PR number", () => {
            expect(commit("feat(tus-sender): add part start event (#910)")).toEqual({
                header: "feat(tus-sender): add part start event",
                type: "feat",
                scope: "tus-sender",
                subject: "add part start event",
                breaking: false,
                files: [],
            });
        });

        it("should detect breaking change from bang", () => {
            expect(commit("feat!: drop react 17").breaking).toBe(true);
        });

        it("should detect breaking change from footer", () => {
            expect(commit("feat: new api\n\nBREAKING CHANGE: old api removed").breaking).toBe(true);
        });

        it("should keep non-conventional header as is", () => {
            const parsed = commit("Update CONTRIBUTING.md to reflect pnpm (#919)");
            expect(parsed.type).toBeUndefined();
            expect(parsed.header).toBe("Update CONTRIBUTING.md to reflect pnpm");
        });
    });

    describe("isIgnoredCommit", () => {
        it.each([
            "chore: release v1.9.0-rc.1 (#781)",
            "chore: update master bundle size report (#926)",
            "chore: update baseline report (🧳 Overweight Guard) (#1050)",
        ])("should ignore: %s", (msg) => {
            expect(isIgnoredCommit(commit(msg))).toBe(true);
        });

        it("should not ignore regular chore", () => {
            expect(isIgnoredCommit(commit("chore: upgrade vitest to v5"))).toBe(false);
        });
    });

    describe("getBumpType", () => {
        it("should return major for breaking change", () => {
            expect(getBumpType([commit("fix: a"), commit("fix!: b"), commit("feat: c")])).toBe("major");
        });

        it("should return minor for feature", () => {
            expect(getBumpType([commit("fix: a"), commit("feat: c")])).toBe("minor");
        });

        it("should return patch otherwise", () => {
            expect(getBumpType([commit("fix: a"), commit("chore(deps): bump x")])).toBe("patch");
        });
    });

    describe("getLabel", () => {
        it("should use scope when it is a package", () => {
            expect(getLabel(commit("fix(uploader): a", ["README.md"]), PACKAGES)).toBe("[uploader]");
        });

        it("should use changed package from files when no scope", () => {
            expect(getLabel(commit("feat: a", ["packages/core/chunked-sender/src/x.js"]), PACKAGES))
                .toBe("[chunked-sender]");
        });

        it("should ignore non-package scope and use files", () => {
            expect(getLabel(commit("fix(storybook): a", ["packages/ui/uploady/src/x.js"]), PACKAGES))
                .toBe("[uploady]");
        });

        it("should list multiple packages", () => {
            expect(getLabel(commit("feat: a", [
                "packages/core/tus-sender/src/x.js",
                "packages/ui/uploady/src/x.js",
                "packages/core/tus-sender/src/y.js",
            ]), PACKAGES)).toBe("[tus-sender, uploady]");
        });

        it("should use all when too many packages changed", () => {
            expect(getLabel(commit("chore: a", PACKAGES.map(({ dir }) => `${dir}src/x.js`)), PACKAGES))
                .toBe("all");
        });

        it("should use ci when only workflow files changed", () => {
            expect(getLabel(commit("fix: a", [".github/workflows/pr.yml"]), PACKAGES)).toBe("ci");
        });

        it("should use all when no package files changed", () => {
            expect(getLabel(commit("docs: a", ["README.md", ".github/x.yml"]), PACKAGES)).toBe("all");
            expect(getLabel(commit("docs: a", []), PACKAGES)).toBe("all");
        });

        it("should not match package by dir prefix of another name", () => {
            expect(getLabel(commit("fix: a", ["packages/ui/uploady-extra/src/x.js"]), PACKAGES)).toBe("all");
        });
    });

    describe("createChangelogEntry", () => {
        it("should create entry in changelog format", () => {
            const entry = createChangelogEntry({
                version: "1.14.0",
                date: "2026-11-12",
                packages: PACKAGES,
                commits: [
                    commit("chore(deps-dev): bump webpack (#1)"),
                    commit("feat: add range header option (#2)", ["packages/core/chunked-sender/src/a.js"]),
                    commit("docs: update readme (#3)", ["README.md"]),
                    commit("fix(uploader): handle abort (#4)", ["packages/core/uploader/src/a.js"]),
                    commit("chore(deps): bump actions/checkout (#5)"),
                    commit("ci: add pr title lint (#6)", [".github/workflows/pr-title.yml"]),
                    commit("feat(uploady)!: new api (#7)"),
                ],
            });

            expect(entry).toBe(`## 1.14.0 (2026-11-12)

### Features

- \`[chunked-sender]\` - feat: add range header option
- \`[uploady]\` - __BREAKING__ feat!: new api

### Bug fixes

- \`[uploader]\` - fix: handle abort

### Docs

- \`all\` - docs: update readme

### Internal

- \`ci\` - ci: add pr title lint
- \`all\` - upgrade dev deps
`);
        });

        it("should mark pre-release and omit empty sections", () => {
            const entry = createChangelogEntry({
                version: "1.14.0-rc.0",
                date: "2026-11-12",
                packages: PACKAGES,
                commits: [commit("fix: a", ["packages/ui/upload-button/src/a.js"])],
            });

            expect(entry).toBe(`## 1.14.0-rc.0 (2026-11-12)

_PRE-RELEASE_

### Bug fixes

- \`[upload-button]\` - fix: a
`);
        });
    });

    describe("addEntryToChangelog", () => {
        it("should insert entry above latest version", () => {
            const changelog = "# Changelog\n\n\n## 1.13.0 (2025-11-26)\n\n### Features\n\n- x\n";

            expect(addEntryToChangelog(changelog, "## 1.14.0 (2026-11-12)\n\n- y\n"))
                .toBe("# Changelog\n\n\n## 1.14.0 (2026-11-12)\n\n- y\n\n\n## 1.13.0 (2025-11-26)\n\n### Features\n\n- x\n");
        });

        it("should append entry when no versions exist", () => {
            expect(addEntryToChangelog("# Changelog\n", "## 1.0.0 (2026-11-12)\n"))
                .toBe("# Changelog\n\n\n## 1.0.0 (2026-11-12)\n");
        });
    });
});
