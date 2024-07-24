import core from "@actions/core"

const reportBundleSize = async (data) => {
    core.info("outputting bundle size report to github summary...")
    core.debug("bundle size data: " + JSON.stringify(data));

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

    //retrieve the table from the summary so we can also add it to the PR
    const reportTable = `<table>${core.summary.stringify().split("<table>")[1].split("</table>")[0]}</table>`;
    core.debug("GOT TABLE FROM SUMMARY " + reportTable);

    core.setOutput("BUNDLE_SIZE_REPORT_TABLE", reportTable);

    await core.summary.write();
};

export default reportBundleSize;
