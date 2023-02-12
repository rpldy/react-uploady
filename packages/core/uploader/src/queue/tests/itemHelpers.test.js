import { FILE_STATES } from "@rpldy/shared";
import getQueueState from "./mocks/getQueueState.mock";
import * as itemHelpers from "../itemHelpers";

describe("itemHelpers tests", () => {
    describe("finalizeItem tests", () => {
        it("should remove item completely with del = true", () => {
            const queueState = getQueueState({
                items: {
                    f1: { id: "f1", batchId: "b1" },
                    f2: { id: "f2", batchId: "b1" },
                },
                activeIds: ["f1", "f2"],
                itemQueue: { "b1": ["f1", "f2"] },
            });

            itemHelpers.finalizeItem(queueState, "f1", true);

            const state = queueState.getState();
            expect(state.itemQueue["b1"]).not.toContain("f1");
            expect(state.itemQueue["b1"]).toContain("f2");
            expect(state.activeIds).not.toContain("f1");

            expect(state.items["f1"]).toBeUndefined();
            expect(state.items["f2"]).toBeDefined();
        });

        it("should finalize item but not remove completely with del = false", () => {
            const queueState = getQueueState({
                items: {
                    f1: { id: "f1", batchId: "b1" },
                    f2: { id: "f2", batchId: "b1" },
                },
                activeIds: ["f1", "f2"],
                itemQueue: { "b1": ["f1", "f2"] },
            });

            itemHelpers.finalizeItem(queueState, "f1");

            const state = queueState.getState();
            expect(state.itemQueue["b1"]).not.toContain("f1");
            expect(state.activeIds).not.toContain("f1");

            expect(state.items["f1"]).toBeDefined();
            expect(state.items["f2"]).toBeDefined();
        });

        it("should cope with item not in state.itemQueue", () => {
            const queueState = getQueueState({
                items: {
                    f1: { id: "f1", batchId: "b1" },
                    f2: { id: "f2", batchId: "b1" },
                },
                activeIds: ["f1", "f2"],
                itemQueue: { "b1": ["f2"] },
            });

            itemHelpers.finalizeItem(queueState, "f1", true);

            const state = queueState.getState();
            expect(state.itemQueue["b1"]).not.toContain("f1");
            expect(state.itemQueue["b1"]).toContain("f2");
            expect(state.activeIds).not.toContain("f1");

            expect(state.items["f1"]).toBeUndefined();
            expect(state.items["f2"]).toBeDefined();
        });

        it("should cope with item not in state.items", () => {
            const queueState = getQueueState({
                items: {
                    f2: { id: "f2", batchId: "b1" },
                },
                activeIds: ["f1", "f2"],
                itemQueue: { "b1": ["f2"] },
            });

            itemHelpers.finalizeItem(queueState, "f1", true);

            const state = queueState.getState();
            expect(state.itemQueue["b1"]).not.toContain("f1");
            expect(state.itemQueue["b1"]).toContain("f2");
            expect(state.activeIds).not.toContain("f1");
            expect(state.items["f2"]).toBeDefined();
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

    describe("getIsItemFinalized tests", () => {
        it.each(
            [
                [FILE_STATES.CANCELLED, true],
                [FILE_STATES.FINISHED, true],
                [FILE_STATES.ABORTED, true],
                [FILE_STATES.ERROR, true],
                [FILE_STATES.ADDED, false],
                [FILE_STATES.PENDING, false],
                [FILE_STATES.UPLOADING, false],
            ])("for %s should return %s", (state, result) => {
            expect(itemHelpers.getIsItemFinalized({ state })).toBe(result);
        });
    });
});
