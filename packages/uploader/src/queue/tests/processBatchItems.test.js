jest.mock("../processFinishedRequest", () => jest.fn());
import getQueueState from "./mocks/getQueueState.mock";
import processBatchItems from "../processBatchItems";
import mockProcessFinishedRequest from "../processFinishedRequest";

describe("processBatchItems tests", () => {
	const mockNext = jest.fn();

	beforeEach(() => {
		clearJestMocks(mockNext);
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
			.toHaveBeenCalledWith(queueState, [{id: "u1", info: requestResponse}], mockNext);

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
				{id: "u1", info: requestResponse},
				{id: "u2", info: requestResponse}], mockNext);


		expect(queueState.state.activeIds).toEqual(["u1", "u2"]);

		expect(queueState.state.items.u1.abort).toBe(sendResult.abort);
		expect(queueState.state.items.u2.abort).toBe(sendResult.abort);
	});

	it("should report cancelled items", () => {







		expect(mockProcessFinishedRequest).toHaveBeenCalledTimes(1);
	});


	it("should send allowed and report cancelled both", () => {

		expect(mockProcessFinishedRequest).toHaveBeenCalledTimes(2);
	});

});