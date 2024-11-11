import uploadyPkg from "../packages/ui/uploady/package.json" with { type: "json" };

const getUploadyVersion = () => {
    return uploadyPkg.version;
};

export {
    getUploadyVersion
}
