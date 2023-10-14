import xhrSend from "@rpldy/sender";
import getTusSend from "../tusSend";

vi.mock("@rpldy/chunked-sender", async () => {
    const org = await vi.importActual("@rpldy/chunked-sender");
    return {
        ...org,
        CHUNKING_SUPPORT: false,
    };
});


describe("tusSend - no chunking support tests", () => {
    const chunkedSender = { send: vi.fn() };

    it("should use xhrSender for no chunk support", () => {
        const send = getTusSend(chunkedSender, null);
        expect(send).toBe(xhrSend);
    });
});
