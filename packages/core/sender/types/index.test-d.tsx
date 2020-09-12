import send, { OnProgress } from "./index";
import { createBatchItem } from "@rpldy/shared";

const batchItem = createBatchItem({ name: "test.png", size: 123, type: "image", lastModified: 1234 }, "b1");

const onProgress: OnProgress = ({ loaded, total }) => {
    console.log("uploaded/completed", { loaded, total });
};

const testSend = async (): Promise<void> => {

    const sendResult = send([batchItem], "test.com", {
        method: "POST",
        forceJsonResponse: true,
        paramName: "file",
        headers: {
            "x-test": "111"
        }
    }, onProgress);

    const result = await sendResult.request;

    console.log(result.response);
};

export {
    testSend,
};
