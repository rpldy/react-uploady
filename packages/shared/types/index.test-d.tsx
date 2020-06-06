import { createBatchItem } from "./index";


const testCreateBatchItem = (): void => {

    const batchItemFile = createBatchItem({ name: "test.png", size: 123, type: "image", lastModified: 1234 }, "b1");

    console.log(batchItemFile.id, batchItemFile.batchId, batchItemFile.file.name);

    const batchItemUrl = createBatchItem("https://my-file.com", "b2");

    console.log(batchItemUrl.id, batchItemUrl.batchId, batchItemUrl.url);
};

export {
    testCreateBatchItem,
};



