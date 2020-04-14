import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { RETRY_EVENT } from "@rpldy/retry";
import "../useRetryListener";

jest.mock("@rpldy/shared-ui", () => ({
    generateUploaderEventHook: jest.fn(),
}));

describe("useRetryListener hook test", () => {
    it("should generate retry even listener hook", () => {
        expect(generateUploaderEventHook).toHaveBeenCalledWith(RETRY_EVENT);
    });
});
