import getChunkedEnhancer, { createChunkedSender } from "./index";
import createUploader from "@rpldy/uploader";
import { createBatchItem } from "@rpldy/shared";

const testGetEnhancer = (): void => {
    const enhancer = getChunkedEnhancer({ chunkSize: 123 });

    const uploader = createUploader({
        enhancer,
    });

    console.log(uploader.getOptions());
};

const testGetSender = (): void => {
    const sender = createChunkedSender({ chunkSize: 123 });

    sender.send([createBatchItem({ name: "test.png" }, "b1")],
        "test.com",
        {
            method: "POST",
            paramName: "file",
            headers: { "x-test": "aaa" } });
};

export {
    testGetEnhancer,
    testGetSender,
};
