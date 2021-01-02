import { FILE_STATES } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { RETRY_EVENT } from "../consts";

const createState = jest.fn(jest.requireActual("@rpldy/simple-state").default);
createState.unwrap = jest.fn((obj) => obj);
jest.doMock("@rpldy/simple-state", () => createState);

const retryEnhancer = require("../retry").default;

describe("retry tests", () => {

	const items = [
		{ id: "f-1", file: "file1", batchId: "b1" },
		{ id: "f-2", url: "url2", batchId: "b1" },
		{ id: "f-3", file: "file3", batchId: "b2" },
		{ id: "f-4", file: "file4", batchId: "b2" },
		{ id: "f-5", url: "url5", batchId: "b3" },
	];

	const getTestRetry = (itemState) => {
		const trigger = jest.fn();
		let retry, retryBatch;

		let uploader = {
			registerExtension: (name, methods) => {
				retry = methods.retry;
				retryBatch = methods.retryBatch;
			},

			on: (event, method) => {
				// if (event === itemEvent) {
                if (event === UPLOADER_EVENTS.ITEM_FINALIZE) {
                    items.map((i) => ({ ...i, state: itemState })).forEach(method);
				}
			},

			add: jest.fn(),
		};

		uploader = retryEnhancer(uploader, trigger);

		const retryState = createState.mock.calls[0][0];

		return {
			retry,
			retryBatch,
			uploader,
			trigger,
			retryState,
		};
	};

	beforeEach(() => {
		clearJestMocks(
			createState,
		);
	});

	const getItemsFromRetryState = (items, retryState) =>
		Object.values(retryState.failed)
			.filter((stateItem) =>
				!!items.find((item) => item.id === stateItem.id));

	describe("retry all tests", () => {
		it.each([
            FILE_STATES.ERROR,
            FILE_STATES.ABORTED
		])("should send all items to retry - %s", (itemState) => {
			const { retry, trigger, uploader, retryState } = getTestRetry(itemState);

			const options = { autoUpload: true },
				expectedItems = getItemsFromRetryState(items, retryState);

			const result = retry();

			expect(result).toBe(true);

			expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items: expectedItems, options });
			expect(uploader.add).toHaveBeenCalledWith(expectedItems, options);

			const result2 = retry();
			expect(result2).toBe(false);

			expect(trigger).toHaveBeenCalledTimes(1);
			expect(uploader.add).toHaveBeenCalledTimes(1);
		});

		it.each([
            FILE_STATES.ERROR,
            FILE_STATES.ABORTED
		])("should send all items with options for event: %s", (itemState) => {
			const { retry, trigger, uploader, retryState } = getTestRetry(itemState);
			const options = { autoUpload: false },
				expectedItems = getItemsFromRetryState(items, retryState);

			retry(null, options);

			expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items: expectedItems, options });
			expect(uploader.add).toHaveBeenCalledWith(expectedItems, options);
		});
	});

	describe("retry item tests", () => {
		it.each([
		    FILE_STATES.ERROR,
			FILE_STATES.ABORTED
		])("should send requested item to retry - %s", (itemState) => {
			const { retry, trigger, uploader, retryState } = getTestRetry(itemState);
			const options = { foo: "bar" };

			const expectedOptions = {
					...options,
					autoUpload: true,
				},
				expectedItems = getItemsFromRetryState([items[2]], retryState);

			const result = retry("f-3", options);

			expect(result).toBe(true);
			expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items: expectedItems, options: expectedOptions });
			expect(uploader.add).toHaveBeenCalledWith(expectedItems, expectedOptions);

			const result2 = retry("f-3", options);
			expect(result2).toBe(false);

			expect(trigger).toHaveBeenCalledTimes(1);
			expect(uploader.add).toHaveBeenCalledTimes(1);
		});
	});

	describe("retry batch tests", () => {
		it.each([
            FILE_STATES.ERROR,
            FILE_STATES.ABORTED
		])("should send batch items to retry", (itemState) => {
			const { retryBatch, trigger, uploader, retryState } = getTestRetry(itemState);

			const options = { foo: "bar" };

			const expectedOptions = {
				...options,
				autoUpload: true,
			};

			const expectedItems = getItemsFromRetryState([items[2], items[3]], retryState);

			const result = retryBatch("b2", options);
			expect(result).toBe(true);

			expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items: expectedItems, options: expectedOptions });
			expect(uploader.add).toHaveBeenCalledWith(expectedItems, expectedOptions);

			const result2 = retryBatch("b2", options);
			expect(result2).toBe(false);

			expect(trigger).toHaveBeenCalledTimes(1);
			expect(uploader.add).toHaveBeenCalledTimes(1);
		});
	});
});
