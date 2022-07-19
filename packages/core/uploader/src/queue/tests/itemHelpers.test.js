import getQueueState from "./mocks/getQueueState.mock";
import * as itemHelpers from "../itemHelpers";

describe("itemHelpers tests", () => {
    describe("finalizeItem tests", () => {
        it("should remove item completely with del = true", () => {
            const queueState = getQueueState({
                items: {
                    f1: { id: "f1" },
                    f2: { id: "f2" }
                },
                activeIds: ["f1", "f2"],
                itemQueue: ["f1", "f2"],
            });

            itemHelpers.finalizeItem(queueState, "f1", true);

            const state = queueState.getState();
            expect(state.itemQueue).not.toContain("f1");
            expect(state.activeIds).not.toContain("f1");

            expect(state.items["f1"]).toBeUndefined();
            expect(state.items["f2"]).toBeDefined();
        });

        it("should finalize item but not remove completely with del = false", () => {
            const queueState = getQueueState({
                items: {
                    f1: { id: "f1" },
                    f2: { id: "f2" }
                },
                activeIds: ["f1", "f2"],
                itemQueue: ["f1", "f2"],
            });

            itemHelpers.finalizeItem(queueState, "f1");

            const state = queueState.getState();
            expect(state.itemQueue).not.toContain("f1");
            expect(state.activeIds).not.toContain("f1");

            expect(state.items["f1"]).toBeDefined();
            expect(state.items["f2"]).toBeDefined();
        });

        it("should cope with item not in itemQueue", () => {
            const queueState = getQueueState({
                items: {
                    f1: { id: "f1" },
                    f2: { id: "f2" }
                },
                activeIds: ["f1", "f2"],
                itemQueue: ["f2"],
            });

            itemHelpers.finalizeItem(queueState, "f1", true);

            const state = queueState.getState();
            expect(state.itemQueue).not.toContain("f1");
            expect(state.activeIds).not.toContain("f1");

            expect(state.items["f1"]).toBeUndefined();
            expect(state.items["f2"]).toBeDefined();
        });
    });

    describe("isItemBelongsToBatch tests", () => {
        const queueState = getQueueState({
            items: {
                u1: { batchId: "b1" },
                u2: { batchId: "b2" },
            },
        });

        it.each([
            ["b2", true],
            ["b1", false]
        ])("for %s should return %s", (bId, expected) => {
            const result = itemHelpers.isItemBelongsToBatch(queueState, "u2", bId);
            expect(result).toBe(expected);
        });
    });

    describe("getIsItemExists tests", () => {
        const queueState = getQueueState({
            items: {
                u1: {}
            }
        });

        it.each([
            ["u1", true],
            ["u2", false],
        ])("for %s should return %s", (id, expected) => {
            const result = itemHelpers.getIsItemExists(queueState, id);
            expect(result).toBe(expected);
        });
    });
});
