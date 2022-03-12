import uploadFile from "../uploadFile";
import { BATCH_ADD, ITEM_ABORT, ITEM_FINISH } from "../../constants";
import { WAIT_SHORT } from

describe("RetryHooks - Retry Upload", () => {
    const fileName = "flower.jpg",
        fileName2 = "sea.jpg";

    before(() => {
        cy.visitStory("retryHooks", "with-retry&knob-mock send delay_Upload Destination=100");
    });

    it("should retry batch", () => {
        //create first batch
        uploadFile(fileName, () => {
            //create second batch
            uploadFile(fileName2, () => {
                cy.wait(WAIT_SHORT);

                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 2 });

                cy.get("li[data-test='batch-retry-0']")
                    .click();

                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 3 });

                cy.wait(WAIT_SHORT);

                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });

                //same batch, second time should do nothing
                cy.get("li[data-test='batch-retry-0']")
                    .click();

                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 3 });
            }, "#upload-button");
        }, "#upload-button");
    });
});
