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

            // setTimeout(() => {
            cy.wait(2000);

                cy.storyLog().assertFileItemStartFinish(fileName, 1);

                cy.storyLog().assertLogEntryContains(3, {
                    id: "batch-1.item-1",
                    loaded: 50376,
                });

                // cy.storyLog().assertLogEntryContains(5, {
                //     totalCount: 8,
                // });
                //
                // cy.storyLog().assertLogEntryContains(15, {
                //     item: {
                //         id: "batch-1.item-1",
                //         loaded: 100752
                //     }
                // });
                //
                // cy.storyLog().customAssertLogEntry("ITEM_PROGRESS", (logLine) => {
                //     expect(logLine[0].completed).to.be.closeTo(40, 0.6);
                // }, { index: 17 });

                cy.storyLog().assertLogEntryContains(21, {
                    id: "batch-1.item-1",
                    completed: 100,
                    loaded: 372445,
                });

                cy.storyLog().assertLogEntryContains(22, {
                    id: "batch-1.item-1",
                    completed: 100,
                    loaded: 372445,
                });

                cy.storyLog().assertLogPattern(CHUNK_START, { times: 8 });
                cy.storyLog().assertLogPattern(CHUNK_FINISH, { times: 8 });
            // }, 1000);
        }, false);

    });
});
