import { SENDER_EVENTS, UPLOADER_EVENTS } from "../../consts";

jest.mock("../processQueueNext", () => jest.fn());
jest.mock("../abort", ()=>({
	abortAll: jest.fn(),
	abortItem: jest.fn(),
	abortBatch: jest.fn(),
}));
import { logger } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import mockProcessNext from "../processQueueNext";
import createQueue from "../";
import abortMethods from "../abort";

describe("queue tests", () => {

	const uploaderId = "uploader111";

	let senderOnHandler;

	const mockSenderOn = jest.fn((name, handler) => {
		senderOnHandler = handler;
	});

	const trigger = jest.fn(),
		cancellable = () => {
		},
		sender = { on: mockSenderOn };

    beforeEach(() => {
        clearJestMocks(trigger);
    });

	it("should initialize and add uploads", () => {

		logger.isDebugOn.mockReturnValueOnce(true);

		const queue = createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

		const batch = { items: [{ id: "u1" }, { id: "u2" }] },
			batchOptions = { concurrent: true };

		queue.uploadBatch(batch, batchOptions);

		expect(mockProcessNext).toHaveBeenCalled();

		const queueState = mockProcessNext.mock.calls[0][0];

		expect(queueState.trigger).toBe(trigger);
		expect(queueState.cancellable).toBe(cancellable);
		expect(queueState.getOptions().destination).toBe("foo");

		const state = queueState.getState();

		expect(state.itemQueue).toEqual(["u1", "u2"]);

		expect(state.items["u1"]).toBe(batch.items[0]);
		expect(state.items["u2"]).toBe(batch.items[1]);

		expect(window[`__${uploaderId}_queue_state`]).toBe(queueState);

		expect(mockSenderOn).toHaveBeenCalledWith(SENDER_EVENTS.PROGRESS, expect.any(Function));
	});

	it("should update state", () => {

		const queue = createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

		expect(queue.getState().currentBatch).toBe(null);

		queue.updateState((state)=>{
			state.currentBatch = "b1";
		});

		expect(queue.getState().currentBatch).toBe("b1");
	});

	it("should call abort method", () => {

		const queue = createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

		queue.abortItem("u1");
		expect(abortMethods.abortItem).toHaveBeenCalledWith(expect.any(Object), "u1");

		queue.abortAll();
		expect(abortMethods.abortAll).toHaveBeenCalledWith(expect.any(Object));

		queue.abortBatch("b1");
		expect(abortMethods.abortBatch).toHaveBeenCalledWith(expect.any(Object), "b1");
	});

    it("should trigger UPLOADER_EVENTS.ITEM_PROGRESS on sender progress", () => {

        const queue = createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

        const batch = { items: [{ id: "u1" }, { id: "u2" }] },
            batchOptions = { };

        queue.uploadBatch(batch, batchOptions);

        senderOnHandler({ id: "u1" }, 20, 1000);

        const state2 = queue.getState();
        expect(state2.items["u1"].loaded).toBe(1000);
        expect(state2.items["u1"].completed).toBe(20);

        expect(trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_PROGRESS, {
            id: "u1",
            loaded: 1000,
            completed: 20,
        });

    });
});
