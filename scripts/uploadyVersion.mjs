import uploadyPkg from "../packages/ui/uploady/package.json" assert { type: "json" };

const getUploadyVersion = () => {
    return uploadyPkg.version;
};

export {
    getUploadyVersion
}
// module.exports = {
//     getUploadyVersion,
// };
