import { logger } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import createState, { unwrap } from "@rpldy/simple-state";
import { SENDER_EVENTS, UPLOADER_EVENTS } from "../../consts";
import processQueueNext from "../processQueueNext";
import * as abortMethods from "../abort";
import createQueue from "../";

jest.mock("@rpldy/simple-state");
jest.mock("../processQueueNext", () => jest.fn());
jest.mock("../abort", () => ({
    abortAll: jest.fn(),
    abortItem: jest.fn(),
    abortBatch: jest.fn(),
}));

describe("queue tests", () => {

    const uploaderId = "uploader111";

    let senderOnHandlers = {};

    const mockSenderOn = jest.fn((name, handler) => {
        senderOnHandlers[name] = handler;
    });

    const trigger = jest.fn(),
        cancellable = jest.fn(),
        sender = { on: mockSenderOn };

    beforeAll(()=>{
    	createState.mockImplementation((state) => ({
			state,
			update: jest.fn((updater) => updater(state)),
		}));
    });

    beforeEach(() => {
        clearJestMocks(
            trigger,
            processQueueNext,
			unwrap,
        );
    });

    it("should initialize and add uploads", () => {

        logger.isDebugOn.mockReturnValueOnce(true);

        const queue = createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

        const batch = { items: [{ id: "u1" }, { id: "u2" }] },
            batchOptions = { concurrent: true };

        queue.uploadBatch(batch, batchOptions);

        expect(processQueueNext).toHaveBeenCalled();

        const queueState = processQueueNext.mock.calls[0][0];

        expect(queueState.trigger).toBeInstanceOf(Function);
		queueState.trigger("test", "a", "b");
		expect(unwrap).toHaveBeenCalledWith("a");
		expect(unwrap).toHaveBeenCalledWith("b");
		expect(trigger).toHaveBeenCalledWith("test", undefined, undefined);

        expect(queueState.cancellable).toBeInstanceOf(Function);
        queueState.cancellable("test2", "c", "d");
		expect(unwrap).toHaveBeenCalledWith("c");
		expect(unwrap).toHaveBeenCalledWith("d");
		expect(cancellable).toHaveBeenCalledWith("test2", undefined, undefined);

        expect(queueState.getOptions().destination).toBe("foo");

        const state = queueState.getState();

        expect(state.itemQueue).toEqual(["u1", "u2"]);

        expect(state.items["u1"]).toStrictEqual(batch.items[0]);
        expect(state.items["u2"]).toStrictEqual(batch.items[1]);

        expect(window[`__rpldy_${uploaderId}_queue_state`]).toBe(queueState);

        expect(mockSenderOn).toHaveBeenCalledWith(SENDER_EVENTS.ITEM_PROGRESS, expect.any(Function));
        expect(mockSenderOn).toHaveBeenCalledWith(SENDER_EVENTS.BATCH_PROGRESS, expect.any(Function));
    });

	it("should throw if item id already exists", () => {
		const queue = createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

		const batch = { items: [{ id: "u1" }, { id: "u2" }] },
			batchOptions = { concurrent: true };

		queue.uploadBatch(batch, batchOptions);

		expect(() => {
			queue.uploadBatch(batch, batchOptions);
		}).toThrow("Uploader queue conflict - item u1 already exists");
	});

	it("should update state", () => {

        const queue = createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

        expect(queue.getState().currentBatch).toBe(null);

        queue.updateState((state) => {
            state.currentBatch = "b1";
        });

        expect(queue.getState().currentBatch).toBe("b1");
    });

    it("should call abort method", () => {

        const queue = createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

        queue.abortItem("u1");
        expect(abortMethods.abortItem).toHaveBeenCalledWith(expect.any(Object), "u1", processQueueNext);

        queue.abortAll();
        expect(abortMethods.abortAll).toHaveBeenCalledWith(expect.any(Object), processQueueNext);

        queue.abortBatch("b1");
        expect(abortMethods.abortBatch).toHaveBeenCalledWith(expect.any(Object), "b1", processQueueNext);
    });

    it("getCurrentActiveCount should return active count", () => {

        const queue = createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

        queue.updateState((state) => {
            state.activeIds = [1, 2];
        });

        queue.uploadBatch({ items: [] });

        const queueState = processQueueNext.mock.calls[0][0];
        expect(queueState.getCurrentActiveCount()).toBe(2);
    });

    describe("UPLOADER_EVENTS.ITEM_PROGRESS tests", () => {
        it("should trigger UPLOADER_EVENTS.ITEM_PROGRESS on sender item progress", () => {

            const queue = createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

            const batch = { items: [{ id: "u1" }, { id: "u2" }] },
                batchOptions = {};

            queue.uploadBatch(batch, batchOptions);

            senderOnHandlers[SENDER_EVENTS.ITEM_PROGRESS]({ id: "u1" }, 20, 1000);

            const state2 = queue.getState();
            expect(state2.items["u1"].loaded).toBe(1000);
            expect(state2.items["u1"].completed).toBe(20);

            unwrap.mockReturnValueOnce("unwrapped");

            expect(trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_PROGRESS, undefined);
            expect(unwrap).toHaveBeenCalledWith({
				id: "u1",
				loaded: 1000,
				completed: 20,
			});
        });

        it("should not trigger event if no item found", () => {
            createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

            senderOnHandlers[SENDER_EVENTS.ITEM_PROGRESS]({ id: "u1" }, 20, 1000);

            expect(trigger).not.toHaveBeenCalled();
        });
    });

    describe("UPLOADER_EVENTS.BATCH_PROGRESS tests", () => {

        it("should trigger UPLOADER_EVENTS.BATCH_PROGRESS on sender batch progress ", () => {
            const queue = createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

            const batch = {
                    id: "b1",
                    items: [
                        { id: "u1", completed: 20, loaded: 1000 },
                        { id: "u2", completed: 80, loaded: 3000 }
                    ]
                },
                batchOptions = {};

            queue.uploadBatch(batch, batchOptions);

            senderOnHandlers[SENDER_EVENTS.BATCH_PROGRESS](batch);

            const state2 = queue.getState();
            expect(state2.batches["b1"].batch.completed).toBe(50);
            expect(state2.batches["b1"].batch.loaded).toBe(4000);

			unwrap.mockReturnValueOnce("unwrapped");

            expect(trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_PROGRESS,"unwrapped");

            expect(unwrap).toHaveBeenCalledWith( {
				...batch,
				completed: 50,
				loaded: 4000,
			})
        });

        it("should not trigger event if no batch found", () => {
            createQueue({ destination: "foo" }, cancellable, trigger, sender, uploaderId);

            senderOnHandlers[SENDER_EVENTS.BATCH_PROGRESS]({ id: "b1" });

            expect(trigger).not.toHaveBeenCalled();
        });
    });
});
