import fs from "fs";
import path from "path";
import core from "@actions/core";
import { DefaultArtifactClient } from "@actions/artifact";
import { parseFileSize } from "./utils.mjs";

const BUNDLE_SIZE_REPORT_ARTIFACT = "bundle-size-report-master";

const BRANCH = process.env.GITHUB_REF_NAME || process.env.GITHUB_REF;

const getBundleSizeReportArtifactData = async () => {
    let data;
    const artifactClient = new DefaultArtifactClient();

    try {
        const { artifact } = await artifactClient.getArtifact(BUNDLE_SIZE_REPORT_ARTIFACT) || {};

        if (artifact) {
            core.info(`found bundle size report artifact info (id: ${artifact.id}) from MASTER (size: ${artifact.size}), created at: ${artifact.createdAt}`);

            try {
                const { downloadPath } = await artifactClient.downloadArtifact(artifact.id);
                core.info("downloaded bundle size report artifact from MASTER");
                core.debug(`reading data from: ${downloadPath}`);

                const str = fs.readFileSync(downloadPath, { encoding: "utf-8" });
                data = JSON.parse(str);

                core.info(`loaded master data with ${data.length} rows`);
                core.debug(str);
            } catch (ex) {
                core.warning("failed to download bundle size report artifact from MASTER - " + ex.message);
            }
        }
    } catch (ex) {
        core.info("no bundle size report artifact found from MASTER, skipping comparison ")
        core.debug(ex.message);
        throw ex;
    }

    return data;
};

const getWithPreviousBundleSizeReport = async (data) => {
    let updatedData = data;

    if (!BRANCH.includes("master")) {
        core.info("looking for bundle size report artifact from MASTER");
        const masterData = await getBundleSizeReportArtifactData() || [];

        updatedData = data.map((row) => {
            const masterRow = masterData.find((r) => r.name === name);

            const previous = masterRow ?
                parseFileSize(row.size) - parseFileSize(masterRow.size) : "N/A";

            const trend = masterRow ? (previous > 0 ? "🔺" : (previous < 0 ? "⬇" : "=")) : "N/A";

            return {
                ...row,
                previous,
                trend,
            }
        });
    } else {
        core.info("skipping download of bundle size report artifact on MASTER");
    }

    return updatedData;
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
            BUNDLE_SIZE_REPORT_ARTIFACT,
            [reportPath],
            path.resolve("./"),
            // gh limits to 90 days max {
            //     retentionDays: 720
            // }
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
    core.debug("bundle size data with compare: " + dataWithMasterCompare);

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

    //on Master save report as artifact for comparing with next time PR is run - we save data without compare info!
    await uploadBundleSizeReport(JSON.stringify(data));
};

export default reportBundleSize;
