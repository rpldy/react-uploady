const { getPackages } = require("@monorepo-utils/package-utils");

const getMatchingPackages =  () => {
    const pkgs = getPackages(".");

    return pkgs.map((pkg) => {
        return {
            name: pkg.packageJSON.name,
            location: pkg.location,
            json: pkg.packageJSON,
            get(field){
                return pkg.packageJSON[field];
            }
        };
    });
};

module.exports = {
    getMatchingPackages,
};
