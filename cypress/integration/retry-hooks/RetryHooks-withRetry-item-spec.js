import uploadFile from "../uploadFile";
import { BATCH_ADD, ITEM_FINISH, ITEM_ABORT } from "../../constants";

describe("RetryHooks - Retry Upload - Item", () => {
    const fileName = "flower.jpg",
        fileName2 = "sea.jpg";

    before(() => {
        cy.visitStory(
            "retryHooks",
            "with-retry",
            { mockDelay: 100 }
        );
    });

    it("should retry item", () => {
        //create first batch
        uploadFile(fileName, () => {
            //create second batch
            uploadFile(fileName2, () => {
                cy.waitExtraShort();

                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 2 });

                cy.get("li[data-test='item-retry-0']")
                    .click();

                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 3 });

                cy.waitShort();

                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
            }, "#upload-button");
        }, "#upload-button");
    });
});
