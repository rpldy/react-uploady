const core = require("@actions/core"),
    { extractChangelogNotesForCurrentVersion } = require("../../../scripts/extractChangeLogNotes");

const extractVersionLog = async () => {
    try {
        console.log("about to retrieve version info from CHANGELOG");
        const { version, versionLog } = await extractChangelogNotesForCurrentVersion();

        if (!versionLog) {
            throw new Error(`Failed to retrieve log info for ${version}`);
        }

        console.log(`Retrieved version ${version} log = `, versionLog);

        core.setOutput("versionLog", versionLog);
    } catch (ex) {
        core.setFailed(ex.message);
    }
}

extractVersionLog()

// github = require("@actions/github"),
//core.getInput('who-to-greet');
