import createChunkedSender from "../chunkedSender";
import getChunkedEnhancer from "../getChunkedEnhancer";

jest.mock("../chunkedSender", () => jest.fn());

describe("chunkedEnhancer tests", () => {

    it("should enhance uploader with chunked sender", () => {
        const options = { chunkSize: 111 };
        const uploader = { update: jest.fn() };

		createChunkedSender.mockReturnValueOnce({send: "chunkedSend"});

        const enhancer = getChunkedEnhancer(options);
        const result = enhancer(uploader, "trigger");

        expect(result).toBe(uploader);
        expect(createChunkedSender).toHaveBeenCalledWith(options, "trigger");
        expect(uploader.update).toHaveBeenCalledWith({ send: "chunkedSend" });
    });
});
