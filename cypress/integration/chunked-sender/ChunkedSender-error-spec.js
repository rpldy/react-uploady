import { interceptWithHandler } from "../intercept";
import uploadFile from "../uploadFile";
import { CHUNK_START, CHUNK_FINISH, ITEM_ERROR } from "../../constants";

describe("ChunkedSender - Progress", () => {
    const fileName = "flower.jpg";

    const loadStory = () =>
        cy.visitStory(
            "chunkedSender",
            "with-chunked-sender&knob-chunk size (bytes)_Upload Settings=50000",
            { useMock: false }
        );

    it("should provide server error info to item error handler", () => {
        loadStory();

        let requestsCounter = 0;

        interceptWithHandler((req) => {
            requestsCounter+=1;
            const isFail = requestsCounter > 1;
            req.reply( isFail ? 400 : 200, { result: isFail ? "you did something bad" : "good job" });
        }, "canceledReq");

        uploadFile(fileName, () => {
            cy.get("#form-submit")
                .should("be.visible")
                .click();

            cy.waitShort();

            cy.storyLog().assertLogPattern(CHUNK_START, { times: 2 });
            cy.storyLog().assertLogPattern(CHUNK_FINISH, { times: 1 });

            cy.storyLog().customAssertLogEntry("ITEM_ERROR", (logLines) => {
                expect(logLines[0].uploadResponse.reason).to.eql("At least one chunk failed");

                const itemErrorCode = logLines[0].uploadResponse.chunkUploadResponse.status;
                expect(itemErrorCode).to.eql(400);

                const itemErrorMessage = logLines[0].uploadResponse.chunkUploadResponse.response.data.result;
                expect(itemErrorMessage).to.eql("you did something bad");
            });
        }, false);
    });
});
