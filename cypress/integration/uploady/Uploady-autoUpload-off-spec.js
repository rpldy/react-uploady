import uploadFile, { uploadFileTimes } from "../uploadFile";
import { BATCH_ADD, ITEM_START, ITEM_FINISH, ITEM_ABORT } from "../../constants";

describe("Uploady - autoUpload off tests", () => {
    const fileName = "flower.jpg";

    const reload = () => {
        cy.visitStory(
            "uploady",
            "with-auto-upload-off",
            { mockDelay: 500 }
        );
    };

    beforeEach(() => {
        //refresh UI And cypress log
        reload(); //cy.reload seems to have broken between 9.5 and 12.5
    });

    it("should not auto upload", () => {
        uploadFile(fileName, () => {
            uploadFile(fileName, () => {
                cy.waitExtraShort;
                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 2 });
                cy.waitShort();
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

                cy.waitShort();

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

                cy.waitShort();

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

                cy.waitShort();

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
        uploadFileTimes(fileName, () => {
            uploadFileTimes(fileName, () => {
                cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

                cy.get("#process-pending")
                    .click();

                cy.waitExtraShort();

                cy.get("button[data-test='abort-file-2']")
                    .click();

                cy.waitLong();

                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 6 });
                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });

                assertQueueItemState(3, "aborted");
                assertQueueItemState(2, "finished");
                assertQueueItemState(6, "finished");
                assertQueueItemState(7, "finished");
            }, 3, "#upload-button");
        }, 4, "#upload-button");
    });

    it("should abort batch before processing", () => {
        uploadFileTimes(fileName, () => {
            uploadFileTimes(fileName, () => {
                cy.get("button[data-test='abort-batch-0']")
                    .click();

                cy.get("#process-pending")
                    .click();

                cy.waitShort();

                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });

                assertQueueItemState(1, "aborted");
                assertQueueItemState(2, "aborted");
                assertQueueItemState(3, "finished");
                assertQueueItemState(4, "finished");
            }, 2, "#upload-button");
        }, 2, "#upload-button");
    });

    it("should abort batch after processing starts", () => {
        uploadFileTimes(fileName, () => {
            uploadFileTimes(fileName, () => {
                cy.get("#process-pending")
                    .click();

                cy.waitExtraShort();

                cy.get("button[data-test='abort-batch-0']")
                    .click();

                cy.waitShort();

                cy.storyLog().assertLogPattern(ITEM_START, { times: 4 });
                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });

                assertQueueItemState(1, "aborted");
                assertQueueItemState(2, "aborted");
                assertQueueItemState(3, "finished");
                assertQueueItemState(4, "finished");
            }, 2, "#upload-button");
        }, 2, "#upload-button");
    });
});
