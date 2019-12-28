jest.mock("../processFinishedRequest", () => jest.fn());
import { FILE_STATES } from "@rpldy/shared";
import getQueueState from "./mocks/getQueueState.mock";
import processBatchItems from "../processBatchItems";
import mockProcessFinishedRequest from "../processFinishedRequest";

describe("processBatchItems tests", () => {
	const mockNext = jest.fn();

	beforeEach(() => {
		clearJestMocks(
			mockProcessFinishedRequest,
			mockNext);
	});

	const requestResponse = {};

	const sendResult = {
		abort: jest.fn(),
		request: Promise.resolve(requestResponse),
	};

	it("should send allowed item", async () => {

		const batchOptions = {};

		const queueState = getQueueState({
			items: {
				"u1": { id: "u1", batchId: "b1" },
				"u2": { id: "u2" },
			},
			batches: {
				"b1": {
					batch: { id: "b1" },
					batchOptions
				}
			}
		});

		queueState.cancellable.mockResolvedValueOnce(false);
		queueState.sender.send.mockReturnValueOnce(sendResult);

		await processBatchItems(queueState, ["u1"], mockNext);

		expect(queueState.sender.send).toHaveBeenCalledWith([queueState.state.items.u1], batchOptions);
		expect(mockProcessFinishedRequest).toHaveBeenCalledTimes(1);

		expect(mockProcessFinishedRequest)
			.toHaveBeenCalledWith(queueState, [{ id: "u1", info: requestResponse }], mockNext);

		expect(queueState.state.activeIds).toEqual(["u1"]);

		expect(queueState.state.items.u1.abort).toBe(sendResult.abort);
	});

	it("should send allowed items", async () => {

		const batchOptions = {};

		const queueState = getQueueState({
			items: {
				"u1": { id: "u1", batchId: "b1" },
				"u2": { id: "u2" },
			},
			batches: {
				"b1": {
					batch: { id: "b1" },
					batchOptions
				}
			}
		});

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


		expect(queueState.state.activeIds).toEqual(["u1", "u2"]);

		expect(queueState.state.items.u1.abort).toBe(sendResult.abort);
		expect(queueState.state.items.u2.abort).toBe(sendResult.abort);
	});

	it("should report cancelled items", async () => {

		const batchOptions = {};

		const queueState = getQueueState({
			items: {
				"u1": { id: "u1", batchId: "b1" },
				"u2": { id: "u2" },
			},
			batches: {
				"b1": {
					batch: { id: "b1" },
					batchOptions
				}
			}
		});

		queueState.cancellable
			.mockResolvedValueOnce(true)
			.mockResolvedValueOnce(true);

		// queueState.sender.send.mockReturnValueOnce(sendResult);

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

		expect(queueState.state.activeIds).toHaveLength(0)

		expect(queueState.state.items.u1.abort).toBeUndefined();
		expect(queueState.state.items.u2.abort).toBeUndefined();
	});

	it("should send allowed and report cancelled both", async () => {

		const batchOptions = {};

		const queueState = getQueueState({
			items: {
				"u1": { id: "u1", batchId: "b1" },
				"u2": { id: "u2" },
			},
			batches: {
				"b1": {
					batch: { id: "b1" },
					batchOptions
				}
			}
		});

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

		expect(queueState.state.activeIds).toEqual(["u1"]);

		expect(queueState.state.items.u1.abort).toBe(sendResult.abort);
		expect(queueState.state.items.u2.abort).toBeUndefined();
	});

});