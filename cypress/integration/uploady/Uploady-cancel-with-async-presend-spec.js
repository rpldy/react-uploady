import { interceptWithHandler } from "../intercept";
import uploadFile, { uploadFileTimes } from "../uploadFile";
import {
    ITEM_ABORT,
    ITEM_FINISH,
    ITEM_START,
    WAIT_X_SHORT,
    WAIT_MEDIUM,
    BATCH_ABORT,
} from "../../constants";

describe("Uploady - Cancel Upload with long running async pre-send", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploady",
            "with-abort",
            { useMock: false }
        );
    });

    beforeEach(() => {
        //refresh UI And cypress log
        cy.reload();
    });

    it("should handle async pre-send returning after abort batch", () => {
        cy.setUploadOptions({
            delayPreSend: 1000,
            preSendData: { options: { headers: { dummy: true } } },
        });

        uploadFile(fileName, () => {
            cy.get("button[data-test='abort-batch-0']")
                .click();

            cy.wait(WAIT_X_SHORT);

            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });
            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
        });
    });

    it("should handle async pre-send returning after abort item", () => {
        interceptWithHandler((req) => {
            req.reply(200, { success: true });
        });

        cy.setUploadOptions({
            delayPreSend: 1000,
            preSendData: { options: { headers: { dummy: true } } },
        });

        uploadFileTimes(fileName, () => {
            cy.get("button[data-test='abort-file-0']")
                .click();

            cy.wait(WAIT_MEDIUM);

            cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
        }, 2);
    });

    it("should handle async batch start returning after abort item", () => {
        interceptWithHandler((req) => {
            req.reply(200, { success: true });
        });

        cy.setUploadOptions({
            delayBatchStart: 1000,
            preSendData: { options: { headers: { dummy: true } } },
        });

        uploadFile(fileName, () => {
            cy.get("button[data-test='abort-file-0']")
                .click();

            cy.wait(WAIT_MEDIUM);

            cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });
            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
        });
    });

    it("should handle async batch start returning after abort item - multiple files", () => {
        interceptWithHandler((req) => {
            req.reply(200, { success: true });
        });

        cy.setUploadOptions({
            delayBatchStart: 1000,
            preSendData: { options: { headers: { dummy: true } } },
        });

        uploadFileTimes(fileName, () => {
            cy.get("button[data-test='abort-file-0']")
                .click();

            cy.wait(WAIT_MEDIUM);

            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
        }, 2);
    });

    it("should handle async batch start returning after abort batch", () => {
        interceptWithHandler((req) => {
            req.reply(200, { success: true });
        });

        cy.setUploadOptions({
            delayBatchStart: 1000,
            preSendData: { options: { headers: { dummy: true } } },
        });

        uploadFileTimes(fileName, () => {
            cy.get("button[data-test='abort-batch-0']")
                .click();

            cy.wait(WAIT_MEDIUM);

            cy.storyLog().assertLogPattern(BATCH_ABORT, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 2 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });
        }, 2);
    });

    it("should handle async batch start returning after abort batch with multiple batches", () => {
        interceptWithHandler((req) => {
            req.reply(200, { success: true });
        });

        cy.setUploadOptions({
            delayBatchStart: 1000,
            preSendData: { options: { headers: { dummy: true } } },
        });

        uploadFileTimes(fileName, () => {
            uploadFileTimes(fileName, () => {
                cy.get("button[data-test='abort-batch-0']")
                    .click();

                cy.wait(WAIT_MEDIUM);

                cy.storyLog().assertLogPattern(BATCH_ABORT, { times: 1 });
                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
            }, 2, "#upload-button");
        }, 2);
    });
});
