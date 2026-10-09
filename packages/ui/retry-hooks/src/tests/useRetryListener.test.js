import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { RETRY_EVENT } from "@rpldy/retry";
import "../useRetryListener";

vi.mock("@rpldy/shared-ui", () => ({
    generateUploaderEventHook: vi.fn(),
}));

// calls made on module import - captured before mocks are cleared for each test
const hookCalls = [...generateUploaderEventHook.mock.calls];

describe("useRetryListener hook test", () => {
    it("should generate retry even listener hook", () => {
        expect(hookCalls).toContainEqual([RETRY_EVENT, false]);
    });
});
