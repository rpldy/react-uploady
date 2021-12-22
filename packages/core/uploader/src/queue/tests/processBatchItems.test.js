import {
    FILE_STATES,
    utils as mockUtils,
    triggerUpdater
} from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import getQueueState from "./mocks/getQueueState.mock";
import processBatchItems from "../processBatchItems";
import processFinishedRequest from "../processFinishedRequest";
import { UPLOADER_EVENTS } from "../../consts";

jest.mock("../processFinishedRequest");

describe("processBatchItems tests", () => {
    const mockNext = jest.fn();

    const waitForTest = () => Promise.resolve();

    beforeEach(() => {
        clearJestMocks(
            processFinishedRequest,
            triggerUpdater,
            mockNext
        );
    });

    const requestResponse = {};

    const sendResult = {
        abort: jest.fn(),
        request: Promise.resolve(requestResponse),
    };

    const batchOptions = {
        autoUpload: true,
        destination: {}
    };

    const getMockStateData = () => ({
        items: {
            "u1": { id: "u1", batchId: "b1" },
            "u2": { id: "u2", batchId: "b2" },
        },
        batches: {
            "b1": {
                batch: { id: "b1" },
                batchOptions
            }
        },
        aborts: {}
    });

    it("should send allowed item", async () => {
        const queueState = getQueueState(getMockStateData());

        queueState.runCancellable.mockResolvedValueOnce(false);
        queueState.sender.send.mockReturnValueOnce(sendResult);

        triggerUpdater.mockResolvedValueOnce();

        await processBatchItems(queueState, ["u1"], mockNext);
        await waitForTest();

        expect(queueState.sender.send).toHaveBeenCalledWith(
            [queueState.state.items.u1],
            queueState.state.batches["b1"].batch,
            batchOptions);

        expect(processFinishedRequest).toHaveBeenCalledTimes(1);

        expect(processFinishedRequest)
            .toHaveBeenCalledWith(queueState, [{ id: "u1", info: requestResponse }], mockNext);

        expect(queueState.getState().aborts.u1).toBe(sendResult.abort);

        expect(mockNext).toHaveBeenCalledWith(queueState);
    });

    it("should send allowed (multiple) items", async () => {
        const queueState = getQueueState(getMockStateData());

        queueState.runCancellable
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(false);

        queueState.sender.send.mockReturnValueOnce(sendResult);

        triggerUpdater.mockResolvedValueOnce();

        await processBatchItems(queueState, ["u1", "u2"], mockNext);
        await waitForTest();

        expect(queueState.sender.send).toHaveBeenCalledWith(
            Object.values(queueState.state.items),
            queueState.state.batches["b1"].batch,
            batchOptions);

        expect(processFinishedRequest).toHaveBeenCalledTimes(1);

        expect(processFinishedRequest)
            .toHaveBeenCalledWith(queueState, [
                { id: "u1", info: requestResponse },
                { id: "u2", info: requestResponse }], mockNext);

        expect(queueState.getState().aborts.u1).toBe(sendResult.abort);
        expect(queueState.getState().aborts.u2).toBe(sendResult.abort);
    });

    it("should throw in case REQUEST_PRE_SEND update returns different array length", async () => {
        const queueState = getQueueState(getMockStateData());

        queueState.runCancellable
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(false);

        triggerUpdater.mockResolvedValueOnce({ items: ["u1", "u2", "u3"] });

        expect(processBatchItems(queueState, ["u1", "u2"], mockNext)).rejects
            .toThrow("REQUEST_PRE_SEND event handlers must return same items with same ids");
    });

    it("should throw in case REQUEST_PRE_SEND update returns different item ids", async () => {
        const queueState = getQueueState(getMockStateData());

        queueState.runCancellable
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(false);

        mockUtils.isSamePropInArrays.mockReturnValueOnce(false);

        triggerUpdater.mockResolvedValueOnce({ items: [{ id: "u1" }, { id: "u2" }] });

        expect(processBatchItems(queueState, ["u1", "u2"], mockNext)).rejects
            .toThrow("REQUEST_PRE_SEND event handlers must return same items with same ids");
    });

    it("REQUEST_PRE_SEND should update items before sending", async () => {

        const queueState = getQueueState(getMockStateData());

        queueState.runCancellable
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(false);

        queueState.sender.send.mockReturnValueOnce(sendResult);

        mockUtils.isSamePropInArrays.mockReturnValueOnce(true);

        const newItems = [{ id: "u1", batchId: "b1", newProp: 111 },
			{ id: "u2", batchId: "b2", foo: "bar" }];

        const newOptions = {
            test: true,
        };

        triggerUpdater.mockResolvedValueOnce({
            items: newItems,
            options: newOptions,
        });

        await processBatchItems(queueState, ["u1", "u2"], mockNext);

        expect(triggerUpdater).toHaveBeenCalledWith(
            queueState.trigger, UPLOADER_EVENTS.REQUEST_PRE_SEND, {
                items: Object.values(getMockStateData().items), //Object.values(queueState.state.items),
                options: batchOptions,
            });

        expect(queueState.sender.send).toHaveBeenCalledWith(
            Object.values(newItems),
            queueState.state.batches["b1"].batch,
            {
                ...batchOptions,
                ...newOptions
            });

        expect(Object.values(queueState.getState().items)).toEqual(newItems);
    });

    it("REQUEST_PRE_SEND should update options without items", async () => {
        const queueState = getQueueState(getMockStateData());

        queueState.runCancellable
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(false);

        queueState.sender.send.mockReturnValueOnce(sendResult);

        const newOptions = {
            test: true,
            autoUpload: false
        };

        triggerUpdater.mockResolvedValueOnce({
            options: newOptions,
        });

        await processBatchItems(queueState, ["u1", "u2"], mockNext);

        expect(triggerUpdater).toHaveBeenCalledWith(
            queueState.trigger, UPLOADER_EVENTS.REQUEST_PRE_SEND, {
                items: Object.values(queueState.state.items),
                options: batchOptions,
            });

        expect(queueState.sender.send).toHaveBeenCalledWith(
            Object.values(queueState.state.items),
            queueState.state.batches["b1"].batch,
            {
                ...batchOptions,
                ...newOptions
            });

        expect(queueState.getState().batches["b1"].batchOptions).toEqual({
			...batchOptions,
			...newOptions
		});
    });

    it("REQUEST_PRE_SEND should update items without options", async () => {
        const queueState = getQueueState(getMockStateData());

        queueState.runCancellable
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(false);

        queueState.sender.send.mockReturnValueOnce(sendResult);

        mockUtils.isSamePropInArrays.mockReturnValueOnce(true);

        const newItems = [{ id: "u1", batchId: "b1", newProp: 111 }, {
            id: "u2",
            batchId: "b1",
            foo: "bar"
        }];

        triggerUpdater.mockResolvedValueOnce({
            items: newItems,
        });

        await processBatchItems(queueState, ["u1", "u2"], mockNext);

        expect(triggerUpdater).toHaveBeenCalledWith(
            queueState.trigger, UPLOADER_EVENTS.REQUEST_PRE_SEND, {
                items: Object.values(getMockStateData().items),
				options: batchOptions,
            });

        expect(queueState.sender.send).toHaveBeenCalledWith(
            Object.values(newItems),
            queueState.state.batches["b1"].batch,
            batchOptions);

		expect(Object.values(queueState.getState().items)).toEqual(newItems);
    });

    it("should report cancelled items", async () => {

        const queueState = getQueueState(getMockStateData());

        queueState.runCancellable
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true);

        await processBatchItems(queueState, ["u1", "u2"], mockNext);

        expect(queueState.sender.send).not.toHaveBeenCalled();

        expect(processFinishedRequest).toHaveBeenCalledTimes(1);

        expect(processFinishedRequest)
            .toHaveBeenCalledWith(queueState,
                [{ id: "u1", info: { state: FILE_STATES.CANCELLED, response: "cancel", status: 0 } },
                    {
                        id: "u2",
                        info: { state: FILE_STATES.CANCELLED, response: "cancel", status: 0}
                    }], mockNext);

        expect(queueState.state.items.u1.abort).toBeUndefined();
        expect(queueState.state.items.u2.abort).toBeUndefined();
    });

    it("should send allowed and report cancelled both", async () => {
        const queueState = getQueueState(getMockStateData());

        queueState.runCancellable
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);

        triggerUpdater.mockResolvedValueOnce();

        queueState.sender.send.mockReturnValueOnce(sendResult);

        await processBatchItems(queueState, ["u1", "u2"], mockNext);
        await waitForTest();

        expect(queueState.sender.send).toHaveBeenCalledWith(
            [queueState.state.items.u1],
            queueState.state.batches["b1"].batch,
            batchOptions);

        expect(processFinishedRequest).toHaveBeenCalledTimes(2);

        expect(processFinishedRequest)
            .toHaveBeenCalledWith(queueState,
                [{ id: "u1", info: requestResponse }], mockNext);

        expect(processFinishedRequest)
            .toHaveBeenCalledWith(queueState,
                [{
                    id: "u2",
                    info: { state: FILE_STATES.CANCELLED, response: "cancel", status: 0 }
                }], mockNext);

        expect(queueState.getState().aborts.u1).toBe(sendResult.abort);
        expect(queueState.getState().aborts.u2).toBeUndefined();
    });

	it("should allow REQUEST_PRE_SEND to cancel", async() => {
		const queueState = getQueueState(getMockStateData());

		triggerUpdater.mockResolvedValueOnce(false);

		queueState.runCancellable
			.mockResolvedValueOnce(false)
			.mockResolvedValueOnce(false);

		await processBatchItems(queueState, ["u1", "u2"], mockNext);

		expect(Object.values(queueState.getState().items))
			.toEqual(Object.values(getMockStateData().items));

		expect(queueState.getState().batches["b1"].batchOptions)
			.toEqual(getMockStateData().batches["b1"].batchOptions);

		expect(queueState.sender.send).not.toHaveBeenCalled();
	});

    it("should mark item as failed for unexpected sender exception", async () => {

        const queueState = getQueueState(getMockStateData());

        queueState.runCancellable.mockResolvedValueOnce(false);
        queueState.sender.send.mockImplementationOnce(() => {
            throw new Error("SENDER FAIL");
        });

        triggerUpdater.mockResolvedValueOnce();

        await processBatchItems(queueState, ["u1"], mockNext);
        await waitForTest();

        expect(processFinishedRequest.mock.calls[0][1]).toStrictEqual([{
            id: "u1",
            info: { status: 0, state: FILE_STATES.ERROR, response: "SENDER FAIL" },
        }]);

        expect(queueState.getState().aborts["u1"]()).toBe(false);
    });
});
