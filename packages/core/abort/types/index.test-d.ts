import getAbortEnhancer from "./index";
import { createRawUploader } from "@rpldy/raw-uploader";

const testEnhancer = (): void => {
    const abortEnhancer = getAbortEnhancer();

    const uploader = createRawUploader({
        enhancer: abortEnhancer,
    });

    console.log(uploader.getOptions());
};

export {
    testEnhancer,
};
