import { uploadFileTimes } from "../uploadFile";
import {
    ITEM_ABORT,
    BATCH_ABORT,
    ITEM_FINISH,
    ITEM_START,
    BATCH_FINALIZE,
    ALL_ABORT,
} from "../../constants";

describe("Uploady - With Fast Abort", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory("uploady", "with-abort", { mockDelay: 500 });
    });

    const addFastAbortThreshold = () => {
        cy.setUploadOptions({
            fastAbortThreshold: 1,
        });
    };

    it("should abort uploading file - no effect", () => {
        addFastAbortThreshold();

        const abortSelector = "button[data-test='abort-file-0']";

        cy.get(abortSelector)
            .should("not.exist");

        uploadFileTimes(fileName, () => {
            cy.get(abortSelector)
                .should("be.visible")
                .click();

            cy.waitLong();

            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
        }, 3, "#upload-button");
    });

    it("should abort uploading batch - with fast abort", () => {
        addFastAbortThreshold();

        uploadFileTimes(fileName, () => {
            uploadFileTimes(fileName, () => {
                cy.get("button[data-test='abort-batch-0']")
                    .should("be.visible")
                    .click();

                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });

                cy.storyLog().assertLogPattern(BATCH_ABORT)
                    .then((matches) => {
                        const logIndex = matches[0].index;
                        cy.storyLog().assertLogEntryContains(logIndex, { state: "aborted" });
                    });

                cy.waitLong();

                cy.storyLog().assertLogPattern(ITEM_START, { times: 3 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
                cy.storyLog().assertLogPattern(BATCH_FINALIZE, { times: 2 });
            }, 2, "#upload-button");
        }, 5, "#upload-button");
    });

    it("should abort all - with fast abort", () => {
        addFastAbortThreshold();

        uploadFileTimes(fileName, () => {
            uploadFileTimes(fileName, () => {
                cy.get("button[data-test='story-abort-all-button']")
                    .should("be.visible")
                    .click();

                cy.waitExtraShort();

                cy.storyLog().assertNoLogPattern(ITEM_ABORT);
                cy.storyLog().assertNoLogPattern(BATCH_FINALIZE);
                cy.storyLog().assertLogPattern(ALL_ABORT, { times: 1 });
            }, 2, "#upload-button");
        }, 2, "#upload-button");
    });
});

