import { uploadFileTimes } from "../uploadFile";
import { WAIT_SHORT } from "../specWaitTimes";
import { BATCH_ADD, BATCH_ERROR, BATCH_FINALIZE, ITEM_FINISH, ITEM_START } from "../storyLogPatterns";

describe("Uploady - invalid BATCH_START", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "test-invalid-batch-start&knob-mock send delay_Upload Destination=100");
    });

    it("should fail invalid updated data from batch - forbidden batch return", () => {
        uploadFileTimes(fileName, () => {
            cy.wait(WAIT_SHORT);

            uploadFileTimes(fileName, () => {
                cy.wait(WAIT_SHORT);

                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 2 });
                cy.storyLog().assertLogPattern(BATCH_ERROR, { times: 1 });
                cy.storyLog().assertLogPattern(BATCH_FINALIZE, { times: 2 });

                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
            }, 2, "#upload-button");
        }, 2, "#upload-button");
    });
});
