import fs from "fs";
import core from "@actions/core";
import { DefaultArtifactClient } from "@actions/artifact";

const BUNDLE_SIZE_REPORT_ARTIFACT = "bundle-size-report-master";

const BRANCH = process.env.GITHUB_REF_NAME || process.env.GITHUB_REF;

const getWithPreviousBundleSizeReport = async (data) => {
//tODO: retrieve previous report from master and compare.
// if not available return as is but add columns with N/A

    if (!BRANCH.includes("master")) {
        core.info("looking for bundle size report artifact from MASTER");

        const artifactClient = new DefaultArtifactClient();
        const { artifact } = await artifactClient.getArtifact(BUNDLE_SIZE_REPORT_ARTIFACT) || {};

        if (artifact) {
            core.info(`found bundle size report artifact (id: ${artifact.id}) from MASTER (size: ${artifact.size}), created at: ${artifact.createdAt}`);
            //await artifactClient.downloadArtifact()
        } else {
            core.info("no bundle size report artifact found from MASTER, skipping comparison")
        }
    }

    return data;
};

const uploadBundleSizeReport = async (dataStr) => {
    if (BRANCH.endsWith("master")) {
        core.info("uploading bundle size report to artifacts from MASTER");

        //save to local file we can uploas as artifact
        const reportPath = "./bundle-size-report.json";
        fs.writeFileSync(reportPath, dataStr, { encoding: "utf-8" });
        core.debug("saved report to file: " + reportPath);

        const artifactClient = new DefaultArtifactClient();
        const { id, size } = await artifactClient.uploadArtifact(
            // name of the artifact
            BUNDLE_SIZE_REPORT_ARTIFACT,
            [reportPath],
            {
                // optional: how long to retain the artifact
                // if unspecified, defaults to repository/org retention settings (the limit of this value)
                retentionDays: 720
            }
        );
        core.debug(`saved artifact (${id}) for later comparisons (size: ${size})`);
    } else {
        core.info(`not uploading bundle size report because we're not on MASTER (${BRANCH})`);
    }
};

const reportBundleSize = async (data) => {
    core.info("processing bundle size report...");

    const dataWithMasterCompare = await getWithPreviousBundleSizeReport(data);

    const dataStr = JSON.stringify(dataWithMasterCompare);
    core.debug("bundle size data: " + dataWithMasterCompare);

    const report = [
        //headers
        Object.keys(data[0])
            .map((key) =>
                ({ data: key, header: true })),
        //rows
        ...data.map((row) =>
            Object.entries(row).map(([key, val]) =>
                ({ data: key === "success" ? (val === true ? "🟢" : "💥") : val })))
    ];

    core.debug("Summary Table: " + JSON.stringify(report));

    core.summary
        .addHeading("📦 Bundle Size Report")
        .addTable(report)

    //retrieve the table from the summary, so we can also add it to the PR as a comment
    const reportTable = `<table>${core.summary.stringify().split("<table>")[1].split("</table>")[0]}</table>`;
    core.debug("GOT TABLE FROM SUMMARY " + reportTable);
    core.setOutput("BUNDLE_SIZE_REPORT_TABLE", reportTable);
    core.setOutput("BUNDLE_SIZE_REPORT_DATA", dataStr);

    //flush to summary
    await core.summary.write();

    //on Master save report as artifact (or to git???) for comparing with next time PR is run
    await uploadBundleSizeReport(dataStr);
};

export default reportBundleSize;
