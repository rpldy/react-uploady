import intercept from "../intercept";
import { uploadFileTimes } from "../uploadFile";
import { WAIT_SHORT, WAIT_X_SHORT } from "../specWaitTimes";
import { BATCH_ADD, BATCH_ERROR, BATCH_FINALIZE, ITEM_FINISH, ITEM_START } from "../storyLogPatterns";

describe("Uploady - invalid BATCH_START", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "test-invalid-batch-start&knob-destination_Upload Destination=local&knob-mock send delay_Upload Destination=1000&knob-multiple files_Upload Settings=true&knob-group files in single request_Upload Settings=&knob-max in group_Upload Settings=2&knob-auto upload on add_Upload Settings=true");
    });

    it("should fail invalid updated data from batch - forbidden batch return", () => {
        intercept("http://localhost:4000/upload");

        uploadFileTimes(fileName, () => {
            cy.wait(WAIT_X_SHORT);

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
