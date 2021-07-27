import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { CHUNK_START, CHUNK_FINISH } from "../storyLogPatterns";

describe("ChunkedSender - Progress", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("chunkedSender", "with-chunked-sender&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url&knob-chunk size (bytes)_Upload Settings=50000");
    });

    it("should use chunked sender with progress events", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.get("#form-submit")
                .should("be.visible")
                .click();

            cy.wait(2000);

            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            cy.storyLog().customAssertLogEntry("CHUNK_FINISH", (logLine) => {
                expect(logLine[0].item.loaded).to.be.closeTo(50000, 20000);
            }, { index: 3 });

            cy.storyLog().customAssertLogEntry("CHUNK_FINISH", (logLine) => {
                expect(logLine[0].item.completed).to.be.lessThan(logLine[0].item.file.size);
            }, { index: 17 });

            cy.storyLog().assertLogEntryContains(18, {
                id: "batch-1.item-1",
                completed: 100,
                loaded: 372445,
            });

            cy.storyLog().assertLogPattern(CHUNK_START, { times: 8 });
            cy.storyLog().assertLogPattern(CHUNK_FINISH, { times: 8 });
        }, false);

    });
});
