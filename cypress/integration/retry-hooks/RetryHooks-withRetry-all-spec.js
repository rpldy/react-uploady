import uploadFile from "../uploadFile";
import { ITEM_START, ITEM_ABORT, ITEM_FINISH, BATCH_ADD } from "../../constants";

describe("RetryHooks - Retry Upload - All", () => {
    const fileName = "flower.jpg",
        fileName2 = "sea.jpg";

    before(() => {
        cy.visitStory(
            "retryHooks",
            "with-retry",
            { mockDelay: 100 }
        );
    });

    it("should retry all failed uploads", () => {
        //create first batch
        uploadFile(fileName, () => {
            //create second batch
            uploadFile(fileName2, () => {
                cy.waitShort();

                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 2 });

                cy.get("#retry-all")
                    .should("be.visible")
                    .click();

                cy.waitMedium();

                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });

                cy.storyLog().customAssertLogEntry("###RETRY_EVENT", (logLine) => {
                    expect(Object.getOwnPropertySymbols(logLine[0][0])).to.have.lengthOf(1, "RETRY_EVENT item 0 - shouldnt have proxy symbols");
                    expect(Object.getOwnPropertySymbols(logLine[0][1])).to.have.lengthOf(1, "RETRY_EVENT item 1 - shouldnt have proxy symbols");
                });
            }, "#upload-button");
        }, "#upload-button");
    });
});
