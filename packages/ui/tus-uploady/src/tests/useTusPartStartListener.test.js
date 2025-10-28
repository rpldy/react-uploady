import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { TUS_EVENTS } from "@rpldy/tus-sender";
import "../useTusPartStartListener";

vi.mock("@rpldy/shared-ui");

describe("TUS Part Start Event Listener tests", () => {
    it.each([
        TUS_EVENTS.PART_START
    ])("should generate TUS hooks for: %s", (event) => {
        expect(generateUploaderEventHook).toHaveBeenCalledWith(event);
    });
});
