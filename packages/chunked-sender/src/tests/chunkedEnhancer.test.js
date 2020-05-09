import chunkedSender from "../chunkedSender";
import getChunkedEnhancer from "../getChunkedEnhancer";

jest.mock("../chunkedSender", () => jest.fn());

describe("chunkedEnhancer tests", () => {

    it("should enhance uploader with chunked sender", () => {
        const options = { chunkSize: 111 };
        const uploader = { update: jest.fn() };

        chunkedSender.mockReturnValueOnce({send: "chunkedSend"});

        const enhancer = getChunkedEnhancer(options);
        const result = enhancer(uploader);

        expect(result).toBe(uploader);
        expect(chunkedSender).toHaveBeenCalledWith(options);
        expect(uploader.update).toHaveBeenCalledWith({ send: "chunkedSend" });
    });
});
