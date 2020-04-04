import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { RETRY_EVENT } from "../consts";
import retryEnhancer from "../retry";

describe("", () => {

    const items = [
        { id: "f-1", file: "file1", batchId: "b1" },
        { id: "f-2", url: "url2", batchId: "b1" },
        { id: "f-3", file: "file3", batchId: "b2" },
        { id: "f-4", file: "file4", batchId: "b2" },
        { id: "f-5", url: "url5", batchId: "b3" },
    ];

    const getTestRetry = () => {

        const trigger = jest.fn();
        let retry, retryBatch;

        let uploader = {
            registerExtension: (name, methods) => {
                retry = methods.retry;
                retryBatch = methods.retryBatch;
            },

            on: (event, method) => {
                if (event === UPLOADER_EVENTS.ITEM_ERROR) {
                    items.forEach(method);
                }
            },

            add: jest.fn(),
        };

        uploader = retryEnhancer(uploader, trigger);

        return {
            retry,
            retryBatch,
            uploader,
            trigger,
        };
    };


    describe("retry all tests", () => {

        it("should send all items to retry ", () => {

            const { retry, trigger, uploader, } = getTestRetry();

            const result = retry();

            expect(result).toBe(true);

            const expectedItems = items.map((i) => i.file || i.url);

            expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items: expectedItems });
            expect(uploader.add).toHaveBeenCalledWith(expectedItems, undefined);

            const result2 = retry();
            expect(result2).toBe(false);

            expect(trigger).toHaveBeenCalledTimes(1);
            expect(uploader.add).toHaveBeenCalledTimes(1);
        });

        it("should send all items with options", () => {
            const { retry, trigger, uploader, } = getTestRetry();
            const options = { foo: "bar" };

            retry(null, options);

            const expectedItems = items.map((i) => i.file || i.url);

            expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items: expectedItems, options });
            expect(uploader.add).toHaveBeenCalledWith(expectedItems, options);
        });
    });

    describe("retry item tests", () => {

        it("should send requested item to retry", () => {
            const { retry, trigger, uploader, } = getTestRetry();
            const options = { foo: "bar" };

            const result = retry("f-3", options);
            expect(result).toBe(true);

            expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items: [items[2].file], options });
            expect(uploader.add).toHaveBeenCalledWith([items[2].file], options);

            const result2 = retry("f-3", options);
            expect(result2).toBe(false);

            expect(trigger).toHaveBeenCalledTimes(1);
            expect(uploader.add).toHaveBeenCalledTimes(1);
        });
    });

    describe("retry batch tests", () => {

        it("should send batch items to retry ", () => {
            const { retryBatch, trigger, uploader, } = getTestRetry();

            const options = { foo: "bar" };

            const result = retryBatch("b2", options);
            expect(result).toBe(true);

            const expectedItems = [items[2], items[3]].map((i) => i.file || i.url);

            expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items: expectedItems, options });
            expect(uploader.add).toHaveBeenCalledWith(expectedItems, options);

            const result2 = retryBatch("b2", options);
            expect(result2).toBe(false);

            expect(trigger).toHaveBeenCalledTimes(1);
            expect(uploader.add).toHaveBeenCalledTimes(1);
        });
    });
});
