import core from "@actions/core";

const outputBundleSize = (data) => {
    core.info("outputting bundle size report...");
    const dataStr = JSON.stringify(data);
    core.setOutput("BUNDLE_SIZE_REPORT_DATA", dataStr);
};

export default outputBundleSize;
