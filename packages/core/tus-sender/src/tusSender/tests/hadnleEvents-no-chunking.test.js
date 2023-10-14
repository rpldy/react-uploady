import { CHUNK_EVENTS } from "@rpldy/chunked-sender";
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

    // beforeEach(() => {
    //     clearViMocks(
    //         uploader,
    //         chunkedSender,
    //     );
    // });

    it("should do nothing with no chunk support", () => {
        handleEvents(uploader, null, chunkedSender);
        expect(uploader.on).not.toHaveBeenCalled();
        expect(chunkedSender.on).not.toHaveBeenCalled();
    });

        //
        // beforeAll(async () => {
        //     vi.resetModules();
        //
        //     vi.mock("@rpldy/chunked-sender", async () => {
        //         const org = await vi.importActual("@rpldy/chunked-sender");
        //
        //         return {
        //             CHUNK_EVENTS: org.CHUNK_EVENTS,
        //             CHUNKING_SUPPORT: false,
        //         };
        //     });
        //
        //     const handleEventsMod = await import("../handleEvents");
        //     handleEvents = handleEventsMod.default;
        //
        //     const chunkedSender = await import("@rpldy/chunked-sender");
        //     CHUNK_EVENTS = chunkedSender.CHUNK_EVENTS;
        // });
});
