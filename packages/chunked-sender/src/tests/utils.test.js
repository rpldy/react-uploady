import { DEFAULT_OPTIONS } from "../defaults";
// import * as utils from "../utils";

describe("utils tests", () => {
    let utils, mockBlobSlice;

    beforeAll(()=>{
        mockBlobSlice = jest.spyOn(Blob.prototype, "slice");

        utils = require("../utils");
    });

    describe("isChunkingSupported tests", () => {
        let orgBlob;

        beforeEach(() => {
            orgBlob = window.Blob;
        });

        afterEach(() => {
            window.Blob = orgBlob;
            utils.isChunkingSupported();
        });

        it("should return true", () => {
            expect(utils.isChunkingSupported()).toBe(true);
        });

        it("should return true for webkitSlice", () => {
            window.Blob = {
                prototype: { webkitSlice: true }
            };
            expect(utils.isChunkingSupported()).toBe(true);

        });

        it("should return true for mozSlice", () => {
            window.Blob = {
                prototype: {
                    mozSlice: true
                }
            };

            expect(utils.isChunkingSupported()).toBe(true);
        });

        it("should return false if no blob slice method", () => {
            window.Blob = {
                prototype: {}
            };
            expect(utils.isChunkingSupported()).toBe(false);
        });

        it("should ", () => {
            // noinspection JSAnnotator
            delete window.Blob;
            expect(utils.isChunkingSupported()).toBe(false);
        });
    });

    describe("getMandatoryOptions tests", () => {

        it("should use all defaults", () => {
            const result = utils.getMandatoryOptions({});

            expect(result).toEqual(DEFAULT_OPTIONS);
        });

        it("should use overrides", () => {
            const options = {
                chunked: false,
                chunkSize: 1000,
                retries: 2,
                parallel: 3
            };

            const result = utils.getMandatoryOptions(options);

            expect(result).toEqual(options);
        });
    });

    describe("getChunkDataFromFile tests", () => {
        it("should return chunk", () => {
            const file = new File([1, 2, 3, 5, 6, 7, 8], "test.jpg", { lastModified: 123 });
            const result = utils.getChunkDataFromFile(file, 0, 2);
            expect(result).toBeInstanceOf(Blob);
            expect(result.size).toBe(2);
            expect(result.name).toBe("test.jpg");
        });

        it("should cope with slice method returning empty", () => {
            mockBlobSlice.mockReturnValueOnce(null);
            const result = utils.getChunkDataFromFile(new File([], "test"), 0, 2);
            expect(result).toBe(null);
        });
    });
});
