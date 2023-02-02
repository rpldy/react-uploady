import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { TUS_EVENTS } from "@rpldy/tus-sender";
import "../useTusResumeStartListener";

jest.mock("@rpldy/shared-ui", () => ({
    generateUploaderEventHook: jest.fn(),
}));

describe("TUS eventListenerHooks tests", () => {
    it.each([
        TUS_EVENTS.RESUME_START
    ])("should generate TUS hooks for: %s", (event) => {
        expect(generateUploaderEventHook).toHaveBeenCalledWith(event);
    });
});
