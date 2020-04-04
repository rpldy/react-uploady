import { generateUploaderEventHook} from "@rpldy/shared-ui";
import "../useRetryListener";
import {RETRY_EVENT} from "../consts";

jest.mock("@rpldy/shared-ui", () => ({
    generateUploaderEventHook: jest.fn(),
}));

describe("useRetryListener hook test", () => {
    it("should generate retry even listener hook", () => {
        expect(generateUploaderEventHook).toHaveBeenCalledWith(RETRY_EVENT);
    });
});
