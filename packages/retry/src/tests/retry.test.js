import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { RETRY_EVENT } from "../consts";
import retryEnhancer from "../retry";

describe("retry tests", () => {

	const items = [
		{ id: "f-1", file: "file1", batchId: "b1" },
		{ id: "f-2", url: "url2", batchId: "b1" },
		{ id: "f-3", file: "file3", batchId: "b2" },
		{ id: "f-4", file: "file4", batchId: "b2" },
		{ id: "f-5", url: "url5", batchId: "b3" },
	];

	const getTestRetry = (itemEvent) => {
		const trigger = jest.fn();
		let retry, retryBatch;

		let uploader = {
			registerExtension: (name, methods) => {
				retry = methods.retry;
				retryBatch = methods.retryBatch;
			},

			on: (event, method) => {
				if (event === itemEvent) {
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
		it.each([
			UPLOADER_EVENTS.ITEM_ERROR,
			UPLOADER_EVENTS.ITEM_ABORT,
		])("should send all items to retry ", (itemEvent) => {

			const { retry, trigger, uploader, } = getTestRetry(itemEvent);

			const result = retry();

			expect(result).toBe(true);

			const options = {autoUpload: true};

			expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items , options});
			expect(uploader.add).toHaveBeenCalledWith(items, options);

			const result2 = retry();
			expect(result2).toBe(false);

			expect(trigger).toHaveBeenCalledTimes(1);
			expect(uploader.add).toHaveBeenCalledTimes(1);
		});

		it.each([
			UPLOADER_EVENTS.ITEM_ERROR,
			UPLOADER_EVENTS.ITEM_ABORT,
		])("should send all items with options", (itemEvent) => {
			const { retry, trigger, uploader, } = getTestRetry(itemEvent);
			const options = { autoUpload: false };

			retry(null, options);

			expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items, options });
			expect(uploader.add).toHaveBeenCalledWith(items, options);
		});
	});

	describe("retry item tests", () => {
		it.each([
			UPLOADER_EVENTS.ITEM_ERROR,
			UPLOADER_EVENTS.ITEM_ABORT,
		])("should send requested item to retry", (itemEvent) => {
			const { retry, trigger, uploader, } = getTestRetry(itemEvent);
			const options = { foo: "bar" };

			const result = retry("f-3", options);
			expect(result).toBe(true);

			const expectedOptions = {
				...options,
				autoUpload: true,
			};

			expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items: [items[2]], options: expectedOptions });
			expect(uploader.add).toHaveBeenCalledWith([items[2]], expectedOptions);

			const result2 = retry("f-3", options);
			expect(result2).toBe(false);

			expect(trigger).toHaveBeenCalledTimes(1);
			expect(uploader.add).toHaveBeenCalledTimes(1);
		});
	});

	describe("retry batch tests", () => {
		it.each([
			UPLOADER_EVENTS.ITEM_ERROR,
			UPLOADER_EVENTS.ITEM_ABORT,
		])("should send batch items to retry ", (itemEvent) => {
			const { retryBatch, trigger, uploader, } = getTestRetry(itemEvent);

			const options = { foo: "bar" };

			const result = retryBatch("b2", options);
			expect(result).toBe(true);

			const expectedOptions = {
				...options,
				autoUpload: true,
			};

			const expectedItems =  [items[2], items[3]];

			expect(trigger).toHaveBeenCalledWith(RETRY_EVENT, { items: expectedItems, options: expectedOptions });
			expect(uploader.add).toHaveBeenCalledWith(expectedItems, expectedOptions);

			const result2 = retryBatch("b2", options);
			expect(result2).toBe(false);

			expect(trigger).toHaveBeenCalledTimes(1);
			expect(uploader.add).toHaveBeenCalledTimes(1);
		});
	});
});
