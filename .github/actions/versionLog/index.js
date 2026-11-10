const { extractChangelogNotesForCurrentVersion } = require("../../../scripts/extractChangeLogNotes");

const extractVersionLog = async () => {
    //@actions/core v2+ is ESM only
    const core = await import("@actions/core");

    try {
        console.log("about to retrieve version info from CHANGELOG");
        const { version, versionLog } = await extractChangelogNotesForCurrentVersion();

        if (!versionLog) {
            core.setFailed(`Failed to retrieve log info for ${version}`);
        } else {
            core.setOutput("VERSION", version);
            core.setOutput("VERSION_LOG", versionLog);

            console.log(`Retrieved version ${version} log = `, versionLog);
        }
    } catch (ex) {
        core.setFailed(ex.message);
    }
};

extractVersionLog().catch((ex) => {
    console.error("versionLog failed", ex);
    process.exitCode = 1;
});
