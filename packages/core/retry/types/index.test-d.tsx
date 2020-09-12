import retryEnhancer from "./index";
import createUploader from "@rpldy/uploader";

const testEnhancer = (): void => {
    const uploader = createUploader({
        enhancer: retryEnhancer,
    });

    console.log(uploader.getOptions());
};

export {
    testEnhancer,
};
