import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { CHUNK_START, CHUNK_FINISH } from "../../constants";

describe("ChunkedSender - sendWithRangeHeader", () => {
    const fileName = "flower.jpg";

    it("should include Content-Range header by default (sendWithRangeHeader: true)", () => {
        cy.visitStory(
            "chunkedSender",
            "with-chunked-sender",
            { useMock: false, chunkSize: 50000 }
        );

        intercept();

        uploadFile(fileName, () => {
            cy.get("#form-submit")
                .should("be.visible")
                .click();

            cy.waitShort();

            cy.storyLog().assertLogPattern(CHUNK_START, { times: 8 });
            cy.storyLog().assertLogPattern(CHUNK_FINISH, { times: 8 });

            // Check first chunk has Content-Range header
            cy.wait("@uploadReq")
                .then((xhr) => {
                    expect(xhr.request.headers["content-range"]).to.exist;
                    expect(xhr.request.headers["content-range"]).to.match(/^bytes 0-\d+\/372445$/);
                });

            // Check second chunk has Content-Range header
            cy.wait("@uploadReq")
                .then((xhr) => {
                    expect(xhr.request.headers["content-range"]).to.exist;
                    expect(xhr.request.headers["content-range"]).to.match(/^bytes 50000-\d+\/372445$/);
                });

            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        }, false);
    });

    it("should not include Content-Range header when sendWithRangeHeader is false", () => {
        cy.visitStory(
            "chunkedSender",
            "with-chunked-sender",
            { useMock: false, chunkSize: 50000, customArgs: { sendWithRangeHeader: false } }
        );

        intercept();

        uploadFile(fileName, () => {
            cy.get("#form-submit")
                .should("be.visible")
                .click();

            cy.waitShort();

            cy.storyLog().assertLogPattern(CHUNK_START, { times: 8 });
            cy.storyLog().assertLogPattern(CHUNK_FINISH, { times: 8 });

            // Verify chunks do NOT have Content-Range header
            // Check first chunk
            cy.wait("@uploadReq")
                .then((xhr) => {
                    expect(xhr.request.headers["content-range"]).to.be.undefined
                });

            // Check second chunk
            cy.wait("@uploadReq")
                .then((xhr) => {
                    expect(xhr.request.headers["content-range"]).to.be.undefined
                });

            // Check a middle chunk to ensure consistency
            cy.wait("@uploadReq")
                .then((xhr) => {
                    expect(xhr.request.headers["content-range"]).to.be.undefined
                });

            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        }, false);
    });
});

