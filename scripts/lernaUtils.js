const { getFilteredPackages } = require("@lerna/filter-options"),
    { ListCommand } = require("@lerna/list");


class DepListCommand extends ListCommand {
    initialize() {
        this.result = new Promise((resolve) => {
            //replace the underlying List command result with objects (and not a string)
            getFilteredPackages(this.packageGraph, this.execOpts, this.options)
                .then((packages) => {
                    resolve({
                        packages,
                        graph: this.packageGraph
                    });
                });
        });

        //stop the underlying List command from executing
        return Promise.resolve(false);
    }
}

const getMatchingPackages = async (argv) => {
    const cmd = new DepListCommand(argv);
    await cmd.runner;
    return await cmd.result;
};

module.exports = {
    getMatchingPackages,
};
