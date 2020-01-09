import getQueueState from "./mocks/getQueueState.mock";
import * as abortMethods from "../abort";

describe("abort tests", () => {
	const mockItemAbort = jest.fn(() => true);

	beforeEach(() => {
		clearJestMocks(mockItemAbort);
	});

	it("should abort item ", () => {
		const queue = getQueueState({
			items: {
				"u1": {
					abort: mockItemAbort,
				}
			}
		});

		const result = abortMethods.abortItem(queue, "u1");

		expect(result).toBe(true);
		expect(mockItemAbort).toHaveBeenCalled();
	});

	it("should abort all", () => {

		const queue = getQueueState({
			items: {
				"u1": {
					abort: mockItemAbort,
				},
				"u2": {
					abort: mockItemAbort,
				},
				"u3": {
					abort: mockItemAbort,
				},
			}
		});

		abortMethods.abortAll(queue);

		expect(mockItemAbort).toHaveBeenCalledTimes(3);
	});

	it("should abort batch", () => {


	});
});