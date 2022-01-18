const { Octokit } = require("@octokit/rest");

const createGithubClient = (options = {}, plugins = []) => {
    if (!process.env.GH_TOKEN) {
        throw new Error("GH_TOKEN environment param not found!");
    }

    const CustomOctokit = Octokit.plugin(...plugins);

    return new CustomOctokit ({
        auth: `token ${process.env.GH_TOKEN}`,
    });
};

module.exports = createGithubClient;
