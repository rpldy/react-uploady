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
            [UPLOADER_EVENTS.BATCH_ADD, true],
            [UPLOADER_EVENTS.BATCH_START, false],
            [UPLOADER_EVENTS.BATCH_FINISH, false],
            [UPLOADER_EVENTS.BATCH_CANCEL, false],
            [UPLOADER_EVENTS.BATCH_ABORT, false],
            [UPLOADER_EVENTS.ITEM_START, false],
            [UPLOADER_EVENTS.ITEM_FINISH, false],
            [UPLOADER_EVENTS.ITEM_CANCEL, false],
            [UPLOADER_EVENTS.ITEM_ERROR, false],
            [UPLOADER_EVENTS.ITEM_FINALIZE, false],
            [UPLOADER_EVENTS.REQUEST_PRE_SEND, true],
        ])("should generate hook for: %s", (event, cantScope) => {
        	if (cantScope) {
				expect(generateUploaderEventHook).toHaveBeenCalledWith(event, false);
			} else {
				expect(generateUploaderEventHook).toHaveBeenCalledWith(event);
			}
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
