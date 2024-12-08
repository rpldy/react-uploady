import {
    utils as mockUtils,
    triggerUpdater
} from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import getQueueState from "./mocks/getQueueState.mock";
import { getItemsPrepareUpdater } from "../preSendPrepare";
import { FILE_STATES } from "@rpldy/shared";

describe("preSendPrepare tests", () => {
    const eventType = "test-event",
        retrieveItems = (items) => items,
        retrieveSubject = (items, options) => ({ items, options });

    const items = [
        { id: "u1", batchId: "b1" },
        { id: "u2", batchId: "b2" },
    ];

    const batchOptions = {
        autoUpload: true,
        destination: { url: "a" },
    };

    const getMockStateData = (testItems) => ({
        items: testItems ?
            { ...testItems } :
            items.reduce((res, i) => {
                res[i.id] = i;
                return res;
            }, {}),
        batches: {
            "b1": {
                batch: { id: "b1" },
                batchOptions,
                itemBatchOptions: {},
            },
            "b2": {
                batch: { id: "b2" },
                batchOptions,
                itemBatchOptions: {},
            }
        },
        aborts: {}
    });

    it("should throw in case event handler update returns different array length", async () => {
        const queueState = getQueueState(getMockStateData());

        triggerUpdater.mockResolvedValueOnce({ items: ["u1", "u2", "u3"] });

       await expect(getItemsPrepareUpdater(eventType, retrieveItems)(queueState, items))
            .rejects
            .toThrow(`REQUEST_PRE_SEND(${eventType}) event handlers must return same items with same ids`);
    });

    it("should throw in case event handler returns different item ids", async () => {
        const queueState = getQueueState(getMockStateData());

        mockUtils.isSamePropInArrays.mockReturnValueOnce(false);

        triggerUpdater.mockResolvedValueOnce({ items: [{ id: "u1" }, { id: "u2" }] });

        await expect(getItemsPrepareUpdater(eventType, retrieveItems)(queueState, items))
            .rejects
            .toThrow(`REQUEST_PRE_SEND(${eventType}) event handlers must return same items with same ids`);
    });

    it("should handle empty update", async () => {
        const queueState = getQueueState(getMockStateData());
        const preparer = getItemsPrepareUpdater(eventType, retrieveItems, retrieveSubject);

        triggerUpdater.mockResolvedValueOnce();

        const result = await preparer(queueState, items);

        expect(result.items).toStrictEqual(items);
        expect(result.options).toStrictEqual(batchOptions);
        expect(result.cancelled).toBe(false);
    });

    it("should handle cancel", async () => {
        const queueState = getQueueState(getMockStateData());
        const preparer = getItemsPrepareUpdater(eventType, retrieveItems, retrieveSubject);

        triggerUpdater.mockResolvedValueOnce(false);

        const result = await preparer(queueState, items);

        expect(result.items).toStrictEqual(items);
        expect(result.options).toStrictEqual(batchOptions);
        expect(result.cancelled).toBe(true);
    });

    it("should handle true as response", async () => {
        const queueState = getQueueState(getMockStateData());
        const preparer = getItemsPrepareUpdater(eventType, retrieveItems, retrieveSubject);

        triggerUpdater.mockResolvedValueOnce(true);

        const result = await preparer(queueState, items);

        expect(result.items).toStrictEqual(items);
        expect(result.options).toStrictEqual(batchOptions);
        expect(result.cancelled).toBe(false);
    });

    it("Preparer should update items before sending", async () => {
        const queueState = getQueueState(getMockStateData());
        const preparer = getItemsPrepareUpdater(eventType, retrieveItems, retrieveSubject);

        mockUtils.isSamePropInArrays.mockReturnValueOnce(true);

        const newItems = [
            { id: "u1", batchId: "b1", newProp: 111 },
            { id: "u2", batchId: "b2", foo: "bar" }
        ];

        const newOptions = {
            test: true,
        };

        triggerUpdater.mockResolvedValueOnce({
            items: newItems,
            options: newOptions,
        });

        const result = await preparer(queueState, items);

        expect(result.items).toStrictEqual(newItems);
        expect(result.options).toStrictEqual({ ...batchOptions, ...newOptions });
        expect(result.cancelled).toBe(false);

        expect(triggerUpdater).toHaveBeenCalledWith(
            queueState.trigger, eventType, {
                items: items,
                options: batchOptions,
            }, batchOptions);

        expect(Object.values(queueState.getState().items)).toEqual(newItems);
        expect(queueState.getState().batches["b1"].batchOptions).toStrictEqual(batchOptions);
    });

    it("Preparer should ignore updates for finalized items", async () => {
        const testItems = {
            u1: { id: "u1", batchId: "b1", state: FILE_STATES.ADDED },
            u2: { id: "u2", batchId: "b1", state: FILE_STATES.ABORTED },
            u3: { id: "u3", batchId: "b1", state: FILE_STATES.CANCELLED },
        };

        const queueState = getQueueState(getMockStateData(testItems));

        const preparer = getItemsPrepareUpdater(eventType, retrieveItems, retrieveSubject);

        mockUtils.isSamePropInArrays.mockReturnValueOnce(true);

        const newItems = [
            { id: "u1", batchId: "b1", newProp: 111, state: FILE_STATES.ADDED },
            { id: "u2", batchId: "b1", foo: "bar", state: FILE_STATES.ADDED },
            { id: "u3", batchId: "b1", state: FILE_STATES.ADDED },
        ];

        const newOptions = {
            test: true,
        };

        triggerUpdater.mockResolvedValueOnce({
            items: newItems,
            options: newOptions,
        });

        const result = await preparer(queueState, Object.values(testItems));

        expect(result.options).toStrictEqual({ ...batchOptions, ...newOptions });
        expect(result.cancelled).toBe(false);

        expect(triggerUpdater).toHaveBeenCalledWith(
            queueState.trigger, eventType, {
                items: Object.values(testItems),
                options: batchOptions,
            }, batchOptions);

        expect(Object.values(queueState.getState().items)).toEqual([
            { id: "u1", batchId: "b1", newProp: 111, state: FILE_STATES.ADDED },
            { id: "u2", batchId: "b1", state: FILE_STATES.ABORTED },
            { id: "u3", batchId: "b1", state: FILE_STATES.CANCELLED },
        ]);

        expect(queueState.getState().batches["b1"].batchOptions).toStrictEqual(batchOptions);
    });

    it("Preparar should not override options for batch, instead save per item to avoid pollution", async () => {
        const queueState = getQueueState(getMockStateData());
        const preparer = getItemsPrepareUpdater(eventType, retrieveItems, retrieveSubject);

        triggerUpdater.mockResolvedValueOnce({
            options: {
                destination: { url: "b" },
            },
        });

        const result = await preparer(queueState, items.slice(0,1));

        expect(queueState.getState().batches["b1"].batchOptions.destination.url).toBe("a");
        expect(queueState.getState().batches["b1"].itemBatchOptions[items[0].id]).toBeDefined();
        expect(queueState.getState().batches["b1"].itemBatchOptions[items[0].id].destination.url).toBe("b");
        expect(queueState.getState().batches["b1"].itemBatchOptions[items[1].id]).toBeUndefined();

        expect(result.options).toStrictEqual({ ...batchOptions, ...{ destination: { url: "b" } } });
    });

    it("Preparer should update options without items", async () => {
        const queueState = getQueueState(getMockStateData());
        const preparer = getItemsPrepareUpdater(eventType, retrieveItems, retrieveSubject);

        const newOptions = {
            test: true,
            autoUpload: false
        };

        triggerUpdater.mockResolvedValueOnce({
            options: newOptions,
        });

        const result = await preparer(queueState, items);

        expect(result.items).toStrictEqual(items);
        expect(result.options).toStrictEqual({ ...batchOptions, ...newOptions });
        expect(result.cancelled).toBe(false);

        expect(triggerUpdater).toHaveBeenCalledWith(
            queueState.trigger, eventType, {
                items: Object.values(queueState.state.items),
                options: batchOptions,
            }, batchOptions);

        expect(queueState.getState().batches["b1"].batchOptions).toEqual(batchOptions);
    });

    it("Preparer should update items without options", async () => {
        const queueState = getQueueState(getMockStateData());
        const preparer = getItemsPrepareUpdater(eventType, retrieveItems, retrieveSubject);

        mockUtils.isSamePropInArrays.mockReturnValueOnce(true);

        const newItems = [{ id: "u1", batchId: "b1", newProp: 111 },
            { id: "u2", batchId: "b2", foo: "bar" }];

        triggerUpdater.mockResolvedValueOnce({
            items: newItems,
        });

        const result = await preparer(queueState, items);

        expect(result.items).toStrictEqual(newItems);
        expect(result.options).toStrictEqual(batchOptions);
        expect(result.cancelled).toBe(false);

        expect(triggerUpdater).toHaveBeenCalledWith(
            queueState.trigger, eventType, {
                items: items,
                options: batchOptions,
            }, batchOptions);

        expect(Object.values(queueState.getState().items)).toEqual(newItems);
        expect(queueState.getState().batches["b1"].batchOptions).toStrictEqual(batchOptions);
    });

    it("should use response validator", () => {
        const queueState = getQueueState(getMockStateData());
        const preparer = getItemsPrepareUpdater(
            eventType,
            retrieveItems,
            retrieveSubject,
            () => {
                throw new Error("test");
            }
        );

        triggerUpdater.mockResolvedValueOnce({});

        return expect(preparer(queueState, items)).rejects.toThrow("test");
    });

    it("should handle batch no longer exists", async () => {
        const items = [{ id: "u1", batchId: "b1" }];
        const queueState = getQueueState({
            items,
            batches: {
                "b1": {}
            },
        });

        const preparer = getItemsPrepareUpdater(eventType, retrieveItems, retrieveSubject);

        let r;
        const updaterPromise = new Promise((resolve) => {
            r = resolve;
        });
        triggerUpdater.mockReturnValueOnce(updaterPromise);

        const p = preparer(queueState, items);

        delete queueState.getState().batches["b1"];

        r();
        const result = await p;

        expect(queueState.updateState).not.toHaveBeenCalled();
        expect(result.items).toStrictEqual(items);
    });
});


