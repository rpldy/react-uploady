import fs from "fs";
import path from "path";
import filesize from "filesize";
import { parseFileSize } from "../../../scripts/utils.mjs";

const BRANCH = process.env.GITHUB_REF_NAME || process.env.GITHUB_REF;
const BUNDLE_SIZE_REPORT_FILE = "bundle-size-report.json";

// const getBundleSizeReportArtifactData = async () => {
//     let data;
//     const artifactClient = new DefaultArtifactClient();
//
//     try {
//         const { artifact } = await artifactClient.getArtifact(BUNDLE_SIZE_REPORT_ARTIFACT) || {};
//
//         if (artifact) {
//             core.info(`found bundle size report artifact info (id: ${artifact.id}) from MASTER (size: ${artifact.size}), created at: ${artifact.createdAt}`);
//
//             try {
//                 const { downloadPath } = await artifactClient.downloadArtifact(artifact.id);
//                 core.info("downloaded bundle size report artifact from MASTER");
//                 core.debug(`reading data from: ${downloadPath}`);
//
//                 const str = fs.readFileSync(downloadPath, { encoding: "utf-8" });
//                 data = JSON.parse(str);
//
//                 core.info(`loaded master data with ${data.length} rows`);
//                 core.debug(str);
//             } catch (ex) {
//                 core.warning("failed to download bundle size report artifact from MASTER - " + ex.message);
//             }
//         }
//     } catch (ex) {
//         core.info("no bundle size report artifact found from MASTER, skipping comparison");
//         core.debug(ex.message);
//         throw ex;
//     }
//
//     return data;
// };

const saveUpdatedMasterData = (data, masterData, core) => {
    if (BRANCH.includes("master")) {
        const hasUpdate = data.find((row) => {
            const masterRow = masterData.find((r) => r.name === row.name);
            return !masterRow || row.size !== masterRow.size || row.max !== masterRow.max;
        });

        if (hasUpdate) {
            const reportPath = path.resolve(`./${BUNDLE_SIZE_REPORT_FILE}`);
            core.info(`saving updated master bundle size report to: ${reportPath}`);

            fs.writeFileSync(reportPath, JSON.stringify(data), { encoding: "utf-8" });

            core.setOutput("SAVED_MASTER_REPORT", reportPath);
        } else {
            core.info("not saving updated master bundle size report - no change found");
        }
    }
};

const getBundleSizeReportMasterData = (core) => {
    const reportPath = path.resolve(`./${BUNDLE_SIZE_REPORT_FILE}`);
    core.info(`looking for bundle size report file from MASTER at ${reportPath}`);

    const str = fs.readFileSync(reportPath, { encoding: "utf-8" });
    return JSON.parse(str);
};

const getWithPreviousBundleSizeReport = async (data, masterData, core) => {
    let updatedData = data;

    if (!BRANCH.includes("master")) {
        updatedData = data.map((row) => {
            const masterRow = masterData.find((r) => r.name === name);

            const previous = masterRow ?
                parseFileSize(row.size) - parseFileSize(masterRow.size) : "N/A";

            const trend = masterRow ? (previous > 0 ? "🔺" : (previous < 0 ? "⬇" : "=")) : "N/A";

            return {
                ...row,
                previous,
                trend,
            };
        });
    } else {
        core.info("skipping download of bundle size report artifact on MASTER");
    }

    return updatedData;
};

// const uploadBundleSizeReport = async (dataStr) => {
//on Master save report as artifact for comparing with next time PR is run - we save data without compare info!
//     if (BRANCH.endsWith("master")) {
//         core.info("uploading bundle size report to artifacts from MASTER");
//
//         //save to local file we can uploas as artifact
//         const reportPath = "./bundle-size-report.json";
//         fs.writeFileSync(reportPath, dataStr, { encoding: "utf-8" });
//         core.debug("saved report to file: " + reportPath);
//
//         const artifactClient = new DefaultArtifactClient();
//         const { id, size } = await artifactClient.uploadArtifact(
//             BUNDLE_SIZE_REPORT_ARTIFACT,
//             [reportPath],
//             path.resolve("./"),
//             // gh limits to 90 days max {
//             //     retentionDays: 720
//             // }
//         );
//         core.debug(`saved artifact (${id}) for later comparisons (size: ${size})`);
//     } else {
//         core.info(`not uploading bundle size report because we're not on MASTER (${BRANCH})`);
//     }
// };

const getReportValue = (key, val) => {
    switch (key) {
        case "success":
            return val === true ? "🟢" : "💥"
        case "max":
            return filesize(val);
        default:
            return val;
    }
};

const getTableReportData = (data, core) => {
    const report = [
        //headers
        Object.keys(data[0])
            .map((key) =>
                ({ data: key, header: true })),
        //rows
        ...data.map((row) =>
            Object.entries(row).map(([key, val]) =>
                ({ data: getReportValue(key, val) }))),
    ];

    core.debug("Summary Table: " + JSON.stringify(report));

    return report;
};

export default async ({ core }) => {
    core.info("processing bundle size report...");

    const dataStr = process.env.BUNDLE_SIZE_REPORT;
    core.debug("got bundle size data input: " + dataStr);
    const data = JSON.parse(dataStr);

    const masterData = await getBundleSizeReportMasterData(core);

    const dataWithMasterCompare = await getWithPreviousBundleSizeReport(data, masterData, core);
    core.debug("bundle size data with compare: " + dataWithMasterCompare);
    core.setOutput("BUNDLE_SIZE_REPORT_WITH_COMPARE", JSON.stringify(dataWithMasterCompare));

    const report = getTableReportData(dataWithMasterCompare, core);

    core.summary
        .addHeading("📦 Bundle Size Report")
        .addTable(report)

    //retrieve the table from the summary, so we can also add it to the PR as a comment
    const reportTable = `<table>${core.summary.stringify().split("<table>")[1].split("</table>")[0]}</table>`;
    core.debug("GOT TABLE FROM SUMMARY " + reportTable);
    core.setOutput("BUNDLE_SIZE_REPORT_TABLE", reportTable);

    //flush to summary
    await core.summary.write();

    const failed = data.find(({ success }) => !success);
    if (failed) {
        //fail the action if any bundle size check failed
        throw new Error(`Bundle size check failed for: ${failed.name} (${failed.size}/${failed.max})`);
    }

    saveUpdatedMasterData(data, masterData, core)
};
