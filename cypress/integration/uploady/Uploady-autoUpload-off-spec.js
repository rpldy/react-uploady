import uploadFile, { uploadFileTimes } from "../uploadFile";
import { BATCH_ADD, ITEM_START, ITEM_FINISH, ITEM_ABORT } from "../storyLogPatterns";

describe("Uploady - autoUpload off tests", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "with-auto-upload-off&knob-mock send delay_Upload Destination=200");
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
            }, "#upload-button");
        }, "#upload-button");
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
            }, "#upload-button");
        }, "#upload-button");
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
            }, "#upload-button");
        }, "#upload-button");
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
            }, "#upload-button");
        }, "#upload-button");
    });

    const assertQueueItemState = (index, state) => {
        cy.get(`[data-test=queue-list] > :nth-child(${index}) [data-test=queue-item-state]`)
            .invoke("text")
            .should("eq", state);
    };

    it("should update state for items from different batches after single abort", () => {
        cy.visitStory("uploady", "with-auto-upload-off&knob-mock send delay_Upload Destination=500");

        uploadFileTimes(fileName, () => {
            uploadFileTimes(fileName, () => {
                cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

                cy.get("#process-pending")
                    .click();

                cy.wait(200);

                cy.get("button[data-test='abort-file-2']")
                    .click();

                cy.wait(1500);

                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 6 });
                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });

                assertQueueItemState(3, "aborted");
                assertQueueItemState(2, "finished");
                assertQueueItemState(6, "finished");
                assertQueueItemState(7, "finished");
            }, 3, "#upload-button");
        }, 4, "#upload-button");
    });
});
