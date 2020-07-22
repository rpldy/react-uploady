import { OnProgress } from "@rpldy/sender";
import { createBatchItem } from "@rpldy/shared";
import createUploader from "@rpldy/uploader";
import createMockSender, { getMockSenderEnhancer } from "./index";

const batchItem = createBatchItem({ name: "test.png", size: 123, type: "image", lastModified: 1234 }, "b1");

const onProgress: OnProgress = ({ loaded, total }) => {
    console.log("uploaded/completed", { loaded, total });
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

const testGetEnhancer = (): void => {
    const enhancer = getMockSenderEnhancer({ delay: 123 });

    const uploader = createUploader({
        enhancer,
    });

    console.log(uploader.getOptions());
};

export {
    testMockSend,
    testGetEnhancer
};
