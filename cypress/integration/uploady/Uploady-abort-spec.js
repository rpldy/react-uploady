import { uploadFileTimes } from "../uploadFile";
import {
    ITEM_ABORT,
    BATCH_ABORT,
    ITEM_FINISH,
    WAIT_X_SHORT,
    ITEM_START,
    WAIT_LONG,
    BATCH_FINALIZE,
} from "../../constants";
import { WAIT_SHORT } from "../../constants";

describe("Uploady - With Abort", () => {
    const fileName = "flower.jpg";

    const loadPage =() =>
        cy.visitStory("uploady", "with-abort");

    it("should abort running upload", () => {
        loadPage();
        const abortSelector = "button[data-test='abort-file-0']";

        cy.get(abortSelector)
            .should("not.exist");

        uploadFileTimes(fileName, () => {
            cy.get(abortSelector)
                .should("be.visible")
                .click();

            cy.wait(WAIT_LONG);

            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
        }, 3, "#upload-button");
    });

    it("should abort running batch", () => {
        loadPage();

        uploadFileTimes(fileName, () => {
            uploadFileTimes(fileName, () => {
                cy.wait(WAIT_X_SHORT);

                cy.get("button[data-test='abort-batch-0']")
                    .should("be.visible")
                    .click();

                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 5 });

                cy.storyLog().assertLogPattern(BATCH_ABORT)
                    .then((matches) => {
                        const logIndex = matches[0].index;
                        cy.storyLog().assertLogEntryContains(logIndex, { state: "aborted" });
                    });

                cy.wait(WAIT_LONG);
                cy.storyLog().assertLogPattern(ITEM_START, { times: 3 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });

                cy.storyLog().assertLogPattern(BATCH_FINALIZE, { times: 2 });
            }, 2, "#upload-button");
        }, 5, "#upload-button");
    });

    it("should abort all", () => {
        loadPage();

        uploadFileTimes(fileName, () => {
            uploadFileTimes(fileName, () => {
                cy.wait(WAIT_X_SHORT);
                cy.get("button[data-test='story-abort-all-button']")
                    .should("be.visible")
                    .click();

                cy.wait(WAIT_SHORT);

                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 4 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });
                cy.storyLog().assertLogPattern(BATCH_FINALIZE, { times: 2 });
            }, 2, "#upload-button");
        }, 2, "#upload-button");
    });
});
