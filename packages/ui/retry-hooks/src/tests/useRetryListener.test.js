import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { RETRY_EVENT } from "@rpldy/retry";
import "../useRetryListener";

vi.mock("@rpldy/shared-ui", () => ({
    generateUploaderEventHook: vi.fn(),
}));

describe("useRetryListener hook test", () => {
    it("should generate retry even listener hook", () => {
        expect(generateUploaderEventHook).toHaveBeenCalledWith(RETRY_EVENT, false);
    });
});
