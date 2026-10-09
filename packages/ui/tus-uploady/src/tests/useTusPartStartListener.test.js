import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { TUS_EVENTS } from "@rpldy/tus-sender";
import "../useTusPartStartListener";

vi.mock("@rpldy/shared-ui");

// calls made on module import - captured before mocks are cleared for each test
const hookCalls = [...generateUploaderEventHook.mock.calls];

describe("TUS Part Start Event Listener tests", () => {
    it.each([
        TUS_EVENTS.PART_START
    ])("should generate TUS hooks for: %s", (event) => {
        expect(hookCalls).toContainEqual([event]);
    });
});
