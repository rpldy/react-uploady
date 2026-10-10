import { UPLOADER_EVENTS } from "@rpldy/uploader";
import {
	generateUploaderEventHook,
	generateUploaderEventHookWithState
} from "../hooksUtils";
import "../eventListenerHooks";

vi.mock("../hooksUtils");

// calls made on module import - captured before mocks are cleared for each test
const hookCalls = [...generateUploaderEventHook.mock.calls];
const stateHookCalls = [...generateUploaderEventHookWithState.mock.calls];

describe("eventListenerHooks tests", () => {
    describe("generateUploaderEventHook tests without scope", () => {
        it.each([
            [UPLOADER_EVENTS.BATCH_ADD],
            [UPLOADER_EVENTS.REQUEST_PRE_SEND],
            [UPLOADER_EVENTS.ALL_ABORT],
        ])("should generate hook for: %s", (event) => {
            expect(hookCalls).toContainEqual([event, false]);
        });
    });

    describe("generateUploaderEventHook tests with scope", () => {
        it.each([
            [UPLOADER_EVENTS.BATCH_START],
            [UPLOADER_EVENTS.BATCH_FINISH],
            [UPLOADER_EVENTS.BATCH_CANCEL],
            [UPLOADER_EVENTS.BATCH_ABORT],
            [UPLOADER_EVENTS.BATCH_ERROR],
            [UPLOADER_EVENTS.BATCH_FINALIZE],
            [UPLOADER_EVENTS.ITEM_START],
            [UPLOADER_EVENTS.ITEM_FINISH],
            [UPLOADER_EVENTS.ITEM_CANCEL],
            [UPLOADER_EVENTS.ITEM_ERROR],
            [UPLOADER_EVENTS.ITEM_FINALIZE],
        ])("should generate hook for: %s", (event) => {
            expect(hookCalls).toContainEqual([event]);
        });
    });

    describe("generateUploaderEventHookWithState tests", () => {
        it.each([
            [UPLOADER_EVENTS.ITEM_PROGRESS, 0],
            [UPLOADER_EVENTS.BATCH_PROGRESS, 1]
        ])("should generate state hook for: %s", (event, index) => {
            expect(stateHookCalls)
                .toContainEqual([event, expect.any(Function)]);

            const calculator = stateHookCalls[index][1];

            const item = { test: "foo" };
            expect(calculator(item)).toEqual(item);
        });
    });
});
