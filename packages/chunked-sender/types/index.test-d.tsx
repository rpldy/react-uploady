import getChunkedEnhancer from "./index";
import createUploader from "@rpldy/uploader";

const testGetEnhancer = (): void => {
    const enhancer = getChunkedEnhancer({ chunkSize: 123 });

    const uploader = createUploader({
        enhancer,
    });

    console.log(uploader.getOptions());
};

export {
    testGetEnhancer,
};
