
module.exports = async ({ core }) => {
    const runtimeToken = process.env.ACTIONS_RUNTIME_TOKEN;
    core.setOutput("runtimeToken", runtimeToken);

    const resultsUrl = process.env.ACTIONS_RESULTS_URL;
    core.setOutput("resultsUrl", resultsUrl);

    core.info("Got GH Actions Tokens and set into step output");
};
