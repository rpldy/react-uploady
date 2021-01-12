import uploadFile from "../uploadFile";
import { BATCH_ADD, ITEM_START, ITEM_FINISH } from "../storyLogPatterns";

describe("Uploady - autoUpload off tests", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "with-auto-upload-off&knob-mock send delay_Upload Destination=200", true);
    });

    beforeEach(() => {
        //refresh UI And cypress log
        cy.reload();
    });

    it("should not auto upload", () => {
        uploadFile(fileName, () => {

            uploadFile(fileName, () => {
                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 2 });
                cy.wait(500);
                cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });
            }, "#upload-button", null);
        }, "#upload-button", null);
    });

    it("should process pending", () => {
        uploadFile(fileName, () => {
            uploadFile(fileName, () => {
                cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

                cy.get("#process-pending")
                    .click();

                cy.wait(500);

                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
            }, "#upload-button", null);
        }, "#upload-button", null);
    });

    it("should clear pending", () => {
        uploadFile(fileName, () => {
            cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

            cy.get("#clear-pending")
                .click();

            uploadFile(fileName, () => {
                cy.get("#process-pending")
                    .click();

                cy.wait(500);

                cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
            }, "#upload-button", null);
        }, "#upload-button", null);
    });

    it("should abort individual pending item", () => {

        uploadFile(fileName, () => {
            uploadFile(fileName, () => {
                cy.get("button[data-test='abort-file-0']")
                    .click();

                cy.get("#process-pending")
                    .click();

                cy.wait(500);

                cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
            }, "#upload-button", null);
        }, "#upload-button", null);
    });
});
