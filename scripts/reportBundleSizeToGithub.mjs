import core from "@actions/core"

const reportBundleSize = async (data) => {
    core.info("outputting bundle size report to github summary...")
    core.debug(JSON.stringify(data));

    await core.summary
        .addHeading("Bundle Size Report 📦")
        .addTable([
            ...Object.keys(data[0]).map((key) =>
                ({ data: key, header: true })),
            ...data.flatMap((row) => Object.values(row))
        ])
        .write();
};

export default reportBundleSize;
