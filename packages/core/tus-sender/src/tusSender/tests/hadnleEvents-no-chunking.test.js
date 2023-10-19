import handleEvents from "../handleEvents";

vi.mock("@rpldy/chunked-sender", async () => {
    const org = await vi.importActual("@rpldy/chunked-sender");

    return {
        ...org,
        CHUNKING_SUPPORT: false,
    };
});

describe("handleEvents without chunking support tests", () => {
    const uploader = {
        on: vi.fn(),
    };

    const chunkedSender = {
        on: vi.fn(),
    };

    it("should do nothing with no chunk support", () => {
        handleEvents(uploader, null, chunkedSender);
        expect(uploader.on).not.toHaveBeenCalled();
        expect(chunkedSender.on).not.toHaveBeenCalled();
    });
});
