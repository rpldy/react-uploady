import { UPLOADER_EVENTS } from "@rpldy/uploader";
import {
	generateUploaderEventHook,
	generateUploaderEventHookWithState
} from "../hooksUtils";
import "../eventListenerHooks";

vi.mock("../hooksUtils");

describe("eventListenerHooks tests", () => {
    describe("generateUploaderEventHook tests without scope", () => {
        it.each([
            [UPLOADER_EVENTS.BATCH_ADD],
            [UPLOADER_EVENTS.REQUEST_PRE_SEND],
            [UPLOADER_EVENTS.ALL_ABORT],
        ])("should generate hook for: %s", (event) => {
            expect(generateUploaderEventHook).toHaveBeenCalledWith(event, false);
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
            expect(generateUploaderEventHook).toHaveBeenCalledWith(event);
        });
    });

    describe("generateUploaderEventHookWithState tests", () => {
        it.each([
            [UPLOADER_EVENTS.ITEM_PROGRESS, 0],
            [UPLOADER_EVENTS.BATCH_PROGRESS, 1]
        ])("should generate state hook for: %s", (event, index) => {
            expect(generateUploaderEventHookWithState)
                .toHaveBeenCalledWith(event, expect.any(Function));

            const calculator = generateUploaderEventHookWithState
                .mock.calls[index][1];

            const item = { test: "foo" };
            expect(calculator(item)).toEqual(item);
        });
    });
});
