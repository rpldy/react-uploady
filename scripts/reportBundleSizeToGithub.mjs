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
            Object.entries(row).map(([key,val]) =>
                ({ data: key === "success" ? (val === true ? "🟢" : "💥") : val })))
    ];

    core.debug("Summary Table: " + JSON.stringify(report));

    await core.summary
        .addHeading("Bundle Size Report 📦")
        .addTable(report)
        .write();
};

export default reportBundleSize;
