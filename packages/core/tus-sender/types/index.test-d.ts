import getTusEnhancer from "./index";
import createUploader from "@rpldy/uploader";

const testGetTusEnhancer = (): void => {
    const enhancer = getTusEnhancer({
        deferLength: true,
        parallel: 2,
        forgetOnSuccess: true,
    });

    const uploader = createUploader({
        enhancer,
    });

    console.log(uploader.getOptions());
};

export {
    testGetTusEnhancer,
};