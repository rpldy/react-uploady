import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { TUS_EVENTS } from "@rpldy/tus-sender";
import "../useTusResumeStartListener";

vi.mock("@rpldy/shared-ui");

describe("TUS eventListenerHooks tests", () => {
    it.each([
        TUS_EVENTS.RESUME_START
    ])("should generate TUS hooks for: %s", (event) => {
        expect(generateUploaderEventHook).toHaveBeenCalledWith(event);
    });
});
