import uploadyPkg from "../packages/ui/uploady/package.json";

const getUploadyVersion = () => {
    return uploadyPkg.version;
};

export {
    getUploadyVersion
}
