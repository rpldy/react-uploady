import { uploadFileTimes } from "../uploadFile";
import { BATCH_ADD, BATCH_ERROR, BATCH_FINALIZE, ITEM_FINISH, ITEM_START } from "../../constants";

describe("Uploady - invalid BATCH_START", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploady",
            "test-invalid-batch-start",
            { mockDelay: 200 }
        );
    });

    it("should fail invalid updated data from batch - forbidden batch return", () => {
        uploadFileTimes(fileName, () => {
            cy.waitShort();

            uploadFileTimes(fileName, () => {
                cy.waitShort();

                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 2 });
                cy.storyLog().assertLogPattern(BATCH_ERROR, { times: 1 });
                cy.storyLog().assertLogPattern(BATCH_FINALIZE, { times: 2 });

                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
            }, 2, "#upload-button");
        }, 2, "#upload-button");
    });
});
