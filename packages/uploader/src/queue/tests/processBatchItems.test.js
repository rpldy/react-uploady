jest.mock("../processFinishedRequest", () => jest.fn());
import {
	FILE_STATES,
	utils as mockUtils,
	triggerUpdater as mockTriggerUpdater
} from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import getQueueState from "./mocks/getQueueState.mock";
import processBatchItems, { getItemAbort } from "../processBatchItems";
import mockProcessFinishedRequest from "../processFinishedRequest";
import { UPLOADER_EVENTS } from "../../consts";

describe("processBatchItems tests", () => {
	const mockNext = jest.fn();

	beforeEach(() => {
		clearJestMocks(
			mockProcessFinishedRequest,
			mockTriggerUpdater,
			mockNext);
	});

	const requestResponse = {};

	const sendResult = {
		abort: jest.fn(),
		request: Promise.resolve(requestResponse),
	};

	const batchOptions = {};

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
		}
	});

	it("should send allowed item", async () => {

		const queueState = getQueueState(getMockStateData());

		queueState.cancellable.mockResolvedValueOnce(false);
		queueState.sender.send.mockReturnValueOnce(sendResult);

		await processBatchItems(queueState, ["u1"], mockNext);

		expect(queueState.sender.send).toHaveBeenCalledWith([queueState.state.items.u1], batchOptions);
		expect(mockProcessFinishedRequest).toHaveBeenCalledTimes(1);

		expect(mockProcessFinishedRequest)
			.toHaveBeenCalledWith(queueState, [{ id: "u1", info: requestResponse }], mockNext);

		expect(queueState.getState().activeIds).toEqual(["u1"]);

		expect(queueState.getState().items.u1.abort).toBeInstanceOf(Function);
	});

	it("should send allowed items", async () => {
		const queueState = getQueueState(getMockStateData());

		queueState.cancellable
			.mockResolvedValueOnce(false)
			.mockResolvedValueOnce(false);

		queueState.sender.send.mockReturnValueOnce(sendResult);

		await processBatchItems(queueState, ["u1", "u2"], mockNext);

		expect(queueState.sender.send).toHaveBeenCalledWith(Object.values(queueState.state.items), batchOptions);
		expect(mockProcessFinishedRequest).toHaveBeenCalledTimes(1);

		expect(mockProcessFinishedRequest)
			.toHaveBeenCalledWith(queueState, [
				{ id: "u1", info: requestResponse },
				{ id: "u2", info: requestResponse }], mockNext);

		expect(queueState.getState().activeIds).toEqual(["u1", "u2"]);

		expect(queueState.getState().items.u1.abort).toBeInstanceOf(Function);
		expect(queueState.getState().items.u2.abort).toBeInstanceOf(Function);
	});

	it("should throw in case update returns different array length", async () => {

		const queueState = getQueueState(getMockStateData());

		queueState.cancellable
			.mockResolvedValueOnce(false)
			.mockResolvedValueOnce(false);

		mockTriggerUpdater.mockResolvedValueOnce(["u1", "u2", "u3"]);

		expect(processBatchItems(queueState, ["u1", "u2"], mockNext)).rejects
			.toThrow("REQUEST_PRE_SEND event handlers must return same items with same ids");
	});

	it("should throw in case update returns different item ids", async () => {
		const queueState = getQueueState(getMockStateData());

		queueState.cancellable
			.mockResolvedValueOnce(false)
			.mockResolvedValueOnce(false);

		mockUtils.isSamePropInArrays.mockReturnValueOnce(false);

		mockTriggerUpdater.mockResolvedValueOnce([{ id: "u1" }, { id: "u2" }]);

		expect(processBatchItems(queueState, ["u1", "u2"], mockNext)).rejects
			.toThrow("REQUEST_PRE_SEND event handlers must return same items with same ids");
	});

	it("should update items before sending", async () => {

		const queueState = getQueueState(getMockStateData());

		queueState.cancellable
			.mockResolvedValueOnce(false)
			.mockResolvedValueOnce(false);

		queueState.sender.send.mockReturnValueOnce(sendResult);

		mockUtils.isSamePropInArrays.mockReturnValueOnce(true);

		const newItems = [{ id: "u1", batchId: "b1", newProp: 111 }, {
			id: "u2",
			batchId: "b1",
			foo: "bar"
		}];

		mockTriggerUpdater.mockResolvedValueOnce(newItems);

		await processBatchItems(queueState, ["u1", "u2"], mockNext);

		expect(mockTriggerUpdater).toHaveBeenCalledWith(
			queueState.trigger, UPLOADER_EVENTS.REQUEST_PRE_SEND, Object.values(queueState.state.items));

		expect(queueState.sender.send).toHaveBeenCalledWith(Object.values(newItems), batchOptions);
	});

	it("should report cancelled items", async () => {

		const queueState = getQueueState(getMockStateData());

		queueState.cancellable
			.mockResolvedValueOnce(true)
			.mockResolvedValueOnce(true);

		await processBatchItems(queueState, ["u1", "u2"], mockNext);

		expect(queueState.sender.send).not.toHaveBeenCalled();

		expect(mockProcessFinishedRequest).toHaveBeenCalledTimes(1);

		expect(mockProcessFinishedRequest)
			.toHaveBeenCalledWith(queueState,
				[{ id: "u1", info: { state: FILE_STATES.CANCELLED, response: "cancel" } },
					{
						id: "u2",
						info: { state: FILE_STATES.CANCELLED, response: "cancel" }
					}], mockNext);

		expect(queueState.state.activeIds).toHaveLength(0);

		expect(queueState.state.items.u1.abort).toBeUndefined();
		expect(queueState.state.items.u2.abort).toBeUndefined();
	});

	it("should send allowed and report cancelled both", async () => {
		const queueState = getQueueState(getMockStateData());

		queueState.cancellable
			.mockResolvedValueOnce(false)
			.mockResolvedValueOnce(true);

		queueState.sender.send.mockReturnValueOnce(sendResult);

		await processBatchItems(queueState, ["u1", "u2"], mockNext);

		expect(queueState.sender.send).toHaveBeenCalledWith([queueState.state.items.u1], batchOptions);

		expect(mockProcessFinishedRequest).toHaveBeenCalledTimes(2);

		expect(mockProcessFinishedRequest)
			.toHaveBeenCalledWith(queueState,
				[{ id: "u1", info: requestResponse }], mockNext);

		expect(mockProcessFinishedRequest)
			.toHaveBeenCalledWith(queueState,
				[{
					id: "u2",
					info: { state: FILE_STATES.CANCELLED, response: "cancel" }
				}], mockNext);

		expect(queueState.getState().activeIds).toEqual(["u1"]);

		expect(queueState.getState().items.u1.abort).toBeInstanceOf(Function);
		expect(queueState.getState().items.u2.abort).toBeUndefined();
	});

	describe("getItemAbort tests", () => {
		const xhrAbort = jest.fn(() => true);

		beforeEach(() => {
			clearJestMocks(xhrAbort);
		});

		it.each([
			[FILE_STATES.FINISHED],
			[FILE_STATES.ABORTED],
			[FILE_STATES.CANCELLED],
			[FILE_STATES.ERROR]
		])("should not call abort for item not in progress - %s", (fileState) => {
			const queueState = getQueueState({
				items: {
					"u1": { state: fileState},
				}
			});

			const abort = getItemAbort(queueState, "u1");
			const result = abort();
			expect(result).toBe(false);
		});

		it("should call abort for added item", () => {
			const queueState = getQueueState({
				items: {
					"u1": { state: FILE_STATES.ADDED},
				}
			});

			const abort = getItemAbort(queueState, "u1", xhrAbort);
			const result = abort();
			expect(result).toBe(true);
			expect(xhrAbort).not.toHaveBeenCalled();
		});

		it("should call xhr abort for uploading item", () => {
			const queueState = getQueueState({
				items: {
					"u1": { state: FILE_STATES.UPLOADING},
				}
			});

			const abort = getItemAbort(queueState, "u1", xhrAbort);
			const result = abort();
			expect(result).toBe(true);
			expect(xhrAbort).toHaveBeenCalled();
		});

	});
});