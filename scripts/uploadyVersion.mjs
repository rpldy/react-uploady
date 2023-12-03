const uploadyPkg = require("../packages/ui/uploady/package.json");

const getUploadyVersion = () => {
    return uploadyPkg.version;
};

export {
    getUploadyVersion
}
// module.exports = {
//     getUploadyVersion,
// };
