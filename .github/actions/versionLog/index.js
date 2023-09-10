const core = require("@actions/core"),
    { extractChangelogNotesForCurrentVersion } = require("../../../scripts/extractChangeLogNotes");

const extractVersionLog = async () => {
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
}

extractVersionLog()

// github = require("@actions/github"),
//core.getInput('who-to-greet');
