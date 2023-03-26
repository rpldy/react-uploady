const core = require("@actions/core"),
    // github = require("@actions/github"),
    { extractChangelogNotesForCurrentVersion } = require("../../../scripts/extractChangeLogNotes");

const extractVersionLog = async () => {
    try {
        console.log("about to retrieve version info from CHANGELOG");
        const { versionLog } = await extractChangelogNotesForCurrentVersion();

        console.log("Retrieved version log = ", versionLog);
        //core.getInput('who-to-greet');
        core.setOutput("versionLog", versionLog);

    } catch (ex) {
        core.setFailed(ex.message);
    }
}

extractVersionLog()
