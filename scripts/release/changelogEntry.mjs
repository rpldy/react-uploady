const HEADER_RX = /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<bang>!)?: (?<subject>.+)$/;
const PR_SUFFIX_RX = /\s*\(#\d+\)$/;
const BREAKING_FOOTER_RX = /^BREAKING[ -]CHANGE:/m;

//commits that never belong in the changelog
const IGNORED_RX = [
    /^chore: release v/,
    /^chore: update master bundle size report/,
    /^chore: update baseline report \(🧳 Overweight Guard\)/,
];

//dependabot scopes - collapsed into a single line
const DEP_SCOPES = ["deps", "deps-dev"];
const DEP_UPGRADE_LINE = "- `all` - upgrade dev deps";

//above this number of touched packages, label is `all`
const MAX_LABELED_PACKAGES = 3;

const SECTIONS = [
    { title: "Features", types: ["feat", "perf"] },
    { title: "Bug fixes", types: ["fix"] },
    { title: "Docs", types: ["docs"] },
    //anything else (chore, ci, test, refactor, build, non-conventional, etc.)
    { title: "Internal", types: null },
];

const parseCommit = ({ message, files = [] }) => {
    const header = message.split("\n")[0].trim().replace(PR_SUFFIX_RX, "");
    const groups = header.match(HEADER_RX)?.groups;

    return {
        header,
        type: groups?.type,
        scope: groups?.scope,
        subject: groups?.subject,
        breaking: !!groups?.bang || BREAKING_FOOTER_RX.test(message),
        files,
    };
};

const isIgnoredCommit = (commit) =>
    IGNORED_RX.some((rx) => rx.test(commit.header));

const isDepUpgrade = (commit) =>
    DEP_SCOPES.includes(commit.scope);

const getBumpType = (commits) =>
    commits.some((c) => c.breaking) ? "major" :
        commits.some((c) => c.type === "feat") ? "minor" :
            "patch";

/**
 * packages: [{ name: "chunked-sender", dir: "packages/core/chunked-sender/" }]
 */
const getLabel = (commit, packages) => {
    if (packages.some(({ name }) => name === commit.scope)) {
        return `[${commit.scope}]`;
    }

    const touched = packages
        .filter(({ dir }) => commit.files.some((f) => f.startsWith(dir)))
        .map(({ name }) => name);

    if (!touched.length) {
        return commit.files.length && commit.files.every((f) => f.startsWith(".github/")) ?
            "ci" : "all";
    }

    return touched.length > MAX_LABELED_PACKAGES ? "all" : `[${touched.join(", ")}]`;
};

const getLineText = (commit) => {
    const text = commit.type ?
        `${commit.type}${commit.breaking ? "!" : ""}: ${commit.subject}` :
        commit.header;

    return commit.breaking ? `__BREAKING__ ${text}` : text;
};

const getSectionTitle = (commit) =>
    SECTIONS.find(({ types }) => !types || types.includes(commit.type)).title;

/**
 * commits are expected in chronological order (oldest first), parsed and without ignored ones
 */
const createChangelogEntry = ({ version, date, commits, packages }) => {
    const lines = Object.fromEntries(SECTIONS.map(({ title }) => [title, []]));

    commits
        .filter((c) => !isDepUpgrade(c))
        .forEach((c) => {
            lines[getSectionTitle(c)].push(`- \`${getLabel(c, packages)}\` - ${getLineText(c)}`);
        });

    if (commits.some(isDepUpgrade)) {
        lines.Internal.push(DEP_UPGRADE_LINE);
    }

    const isPreRelease = version.includes("-");

    return [
        `## ${version} (${date})`,
        ...(isPreRelease ? ["_PRE-RELEASE_"] : []),
        ...SECTIONS
            .filter(({ title }) => lines[title].length)
            .map(({ title }) => `### ${title}\n\n${lines[title].join("\n")}`),
    ].join("\n\n") + "\n";
};

//inserts the entry above the latest version entry
const addEntryToChangelog = (changelog, entry) => {
    const firstEntryIndex = changelog.search(/^## /m);

    return firstEntryIndex === -1 ?
        `${changelog.trimEnd()}\n\n\n${entry}` :
        `${changelog.slice(0, firstEntryIndex)}${entry}\n\n${changelog.slice(firstEntryIndex)}`;
};

export {
    parseCommit,
    isIgnoredCommit,
    getBumpType,
    getLabel,
    createChangelogEntry,
    addEntryToChangelog,
};
