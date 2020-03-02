import { UPLOADER_EVENTS } from "@rpldy/uploader";

jest.mock("../utils", () => ({
    generateUploaderEventHook: jest.fn(),
    generateUploaderEventHookWithState: jest.fn(),
}));
import {
    generateUploaderEventHook,
    generateUploaderEventHookWithState
} from "../utils";
import "../eventListenerHooks";

describe("eventListenerHooks tests", () => {
    describe("generateUploaderEventHook tests", () => {
        it.each([
            [UPLOADER_EVENTS.BATCH_ADD],
            [UPLOADER_EVENTS.BATCH_START],
            [UPLOADER_EVENTS.BATCH_FINISH],
            [UPLOADER_EVENTS.BATCH_CANCEL],
            [UPLOADER_EVENTS.BATCH_ABORT],
            [UPLOADER_EVENTS.ITEM_START],
            [UPLOADER_EVENTS.ITEM_FINISH],
            [UPLOADER_EVENTS.ITEM_CANCEL],
            [UPLOADER_EVENTS.ITEM_ERROR],
            [UPLOADER_EVENTS.REQUEST_PRE_SEND],
        ])("should generate hook for: %s", (event) => {
            expect(generateUploaderEventHook).toHaveBeenCalledWith(event);
        });
    });

    describe("generateUploaderEventHookWithState tests", () => {
        it.each([
            UPLOADER_EVENTS.ITEM_PROGRESS,
            UPLOADER_EVENTS.BATCH_PROGRESS
        ])("should generate state hook for: %s", (event) => {
            expect(generateUploaderEventHookWithState)
                .toHaveBeenCalledWith(event, expect.any(Function));

            const calculator = generateUploaderEventHookWithState
                .mock.calls[0][1];

            const item = { test: "foo" };
            expect(calculator(item)).toEqual(item);
        });
    });

});
