const { execSync } = require("child_process");
const fs = require("fs");
const core = require("@actions/core");
const yaml = require("js-yaml");

const MAX_VERSIONS_STORED = 50;

const loadFlowYaml = (wfPath) => {
    let doc;

    console.log(`Loading WF from: ${wfPath}`);
    try {
        doc = yaml.load(fs.readFileSync(wfPath, "utf8"));
    } catch (ex) {
        console.error(`Failed to read yaml file: ${wfPath}`, ex);
        throw new Error("Unable to load WF YAML");
    }

    return doc;
};

const saveFlowYaml = (doc, wfPath) => {
    console.log(`Saving WF to: ${wfPath}`);

    try {
        const docStr = yaml.dump(doc, { lineWidth: -1 });
        fs.writeFileSync(wfPath, docStr, { encoding: "utf8" });
    } catch (ex) {
        console.error(`Failed to save updated yaml file: ${wfPath}`, ex);
        throw new Error("Unable to save WF YAML");
    }
};

const fetchNonDeprecatedVersions = () => {
    console.log("Fetching versions from npm for @rpldy/uploady...");

    try {
        // Get package info including versions and deprecated info
        const packageInfoStr = execSync("npm view @rpldy/uploady --json", { encoding: "utf8" });
        const packageInfo = JSON.parse(packageInfoStr);

        // Extract all versions
        const allVersions = packageInfo.versions;

        // Extract deprecated versions object (if exists)
        const deprecated = packageInfo.deprecated || {};

        // Filter out deprecated versions
        const nonDeprecated = allVersions.filter(version => !deprecated[version]);

        console.log(`Found ${nonDeprecated.length} non-deprecated versions`);
        return nonDeprecated;
    } catch (error) {
        console.error("Error fetching versions from npm:", error);
        throw new Error("Failed to fetch versions from npm");
    }
};

const main = () => {
    try {
        const wfFile = core.getInput("workflow-file");
        const wfInputName = core.getInput("workflow-input") || "version";

        // Fetch versions directly in the action
        const nonDeprecatedVersions = fetchNonDeprecatedVersions();

        if (nonDeprecatedVersions.length) {
            const doc = loadFlowYaml(wfFile);

            console.log(`LOADED WF YAML!`, doc.on.workflow_dispatch.inputs[wfInputName]);

            const versionInput = doc.on.workflow_dispatch.inputs[wfInputName];

            // Ensure first item is always empty
            const versions = ["", ...nonDeprecatedVersions];

            versionInput.options = versions.slice(0, MAX_VERSIONS_STORED);

            saveFlowYaml(doc, wfFile);
            console.log(`UPDATED WF YAML! Storing ${versionInput.options.length} versions in the options list`);

            core.exportVariable("UPDATE_SUCCESS", "true");
        } else {
            console.warn("No versions provided to update the workflow!");
        }

        core.setOutput("success", true);
    } catch (ex) {
        core.setFailed(ex.message);
    }
};

main();
