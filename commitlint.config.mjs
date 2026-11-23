import lernaScopes from "@commitlint/config-lerna-scopes";

//scopes used by dependabot PRs (npm & github-actions)
const EXTRA_SCOPES = ["deps", "deps-dev"];

export default {
    extends: [
        "@commitlint/config-conventional",
        "@commitlint/config-lerna-scopes"
    ],

    "rules": {
        "header-max-length": [2, "always", 120],
        "scope-enum": async (ctx) => {
            const packages = await lernaScopes.utils.getProjects(ctx);
            return [2, "always", [...packages, ...EXTRA_SCOPES]];
        },
    }
};
