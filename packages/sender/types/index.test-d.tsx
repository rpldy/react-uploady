import send, { createMockSender, OnProgress } from "./index";
import { createBatchItem } from "@rpldy/shared";

const batchItem = createBatchItem({ name: "test.png" }, "b1");

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

const testMockSend =  async (): Promise<void> => {

    const mockSender = createMockSender({
        delay: 1100,
        response: { test: true }
    });

    mockSender.update({
        delay: 1200,
        fileSize: 2222222,
    });

    const sendResult = mockSender.send([batchItem], "mocked", {
        method: "PUT",
        paramName: "bla"
    }, onProgress);

    const result = await sendResult.request;

    console.log(result.response);
};

export {
    testSend,
    testMockSend,
};
