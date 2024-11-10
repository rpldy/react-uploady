import { interceptWithHandler } from "../intercept";
import uploadFile, { uploadFileTimes } from "../uploadFile";
import {
    ITEM_ABORT,
    ITEM_FINISH,
    ITEM_START,
    BATCH_ABORT,
} from "../../constants";

describe("Uploady - Cancel Upload with long running async pre-send", () => {
    const fileName = "flower.jpg";

    const loadPage = () =>
        cy.visitStory(
            "uploady",
            "with-abort",
            { useMock: false }
        );

    it("should handle async pre-send returning after abort batch", () => {
        loadPage();

        cy.setUploadOptions({
            delayPreSend: 1000,
            preSendData: { options: { headers: { dummy: true } } },
        });

        uploadFile(fileName, () => {
            cy.get("button[data-test='abort-batch-0']")
                .click();

            cy.waitExtraShort();

            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });
            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
        });
    });

    it("should handle async pre-send returning after abort item", () => {
        loadPage();
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

            cy.waitMedium();

            cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
        }, 2);
    });

    it("should handle async batch start returning after abort item", () => {
        loadPage();
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

            cy.waitMedium();

            cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });
            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
        });
    });

    it("should handle async batch start returning after abort item - multiple files", () => {
        loadPage();
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

            cy.waitMedium();

            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
        }, 2);
    });

    it("should handle async batch start returning after abort batch", () => {
        loadPage();
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

            cy.waitMedium();

            cy.storyLog().assertLogPattern(BATCH_ABORT, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 2 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });
        }, 2);
    });

    it("should handle async batch start returning after abort batch with multiple batches", () => {
        loadPage();
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

                cy.waitMedium();

                cy.storyLog().assertLogPattern(BATCH_ABORT, { times: 1 });
                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
            }, 2, "#upload-button");
        }, 2);
    });
});
