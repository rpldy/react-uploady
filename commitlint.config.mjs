export default {
    extends: [
        "@commitlint/config-conventional",
        "@commitlint/config-lerna-scopes"
    ],

    "rules": {
        "header-max-length": [2, "always", 120],

    }
};
