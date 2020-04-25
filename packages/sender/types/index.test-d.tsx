import send from "./index";
import { createBatchItem} from "@rpldy/shared";

const testSend = (): void => {

    const batchItem = createBatchItem({ name: "test.png" }, "b1");

    const result = send([batchItem], "test.com", {
       forceJsonResponse: true,
       formatGroupParamName: "myFile",
    }, ());

};

const testMockSend = (): voic => {

};

export {
    testSend,
    testMockSend,
};
