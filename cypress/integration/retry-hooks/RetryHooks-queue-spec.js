import { interceptWithDelay } from "../intercept";
import uploadFile, { uploadFileTimes } from "../uploadFile";
import { ITEM_ABORT, ITEM_FINISH, ITEM_START } from "../../constants";
import { WAIT_LONG, WAIT_MEDIUM, WAIT_SHORT } from "../../constants";

const WAIT_OP_TIME = 2247

describe("RetryHooks - Queue", () => {
    const fileName = "flower.jpg",
        fileName2 = "sea.jpg";

    const loadStory = () =>
        cy.visitStory(
            "retryHooks",
            "with-retry-and-preview",
            { useMock: false }
        );

    it("should use queue with retry", () => {
        loadStory();
        interceptWithDelay(700);

        uploadFile(fileName, () => {
            uploadFile(fileName2, () => {
                cy.wait(WAIT_SHORT);

                cy.get("button[data-test='abort-button']:last")
                    .click();

                cy.get("article[data-test='preview-item-container']")
                    .should("have.length", 2);

                cy.get("article[data-test='preview-item-container']:first")
                    .as("firstArticle")
                    .should("have.data", "state", "DONE");

                cy.get("@firstArticle")
                    .find("button[data-test='retry-button']")
                    .should("be.disabled");

                cy.get("@firstArticle")
                    .find("button[data-test='abort-button']")
                    .should("be.disabled");

                cy.get("article[data-test='preview-item-container']:last")
                    .as("secondArticle")
                    .should("have.data", "state", "ABORTED");

                cy.get("@secondArticle")
                    .find("button[data-test='abort-button']")
                    .should("be.disabled");

                cy.get("@secondArticle")
                    .find("button[data-test='retry-button']")
                    .click();

                cy.wait(WAIT_MEDIUM);

                cy.get("@secondArticle")
                    .find("button[data-test='abort-button']")
                    .should("be.disabled");

                cy.get("@secondArticle")
                    .find("button[data-test='retry-button']")
                    .should("be.disabled");

                cy.storyLog().assertFileItemStartFinish(fileName, 1);
                cy.storyLog().assertLogPattern(ITEM_START, { times: 3 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });

                cy.get("button[data-test='queue-clear-button']")
                    .click();

                cy.get("article[data-test='preview-item-container']")
                    .should("have.length", 0);
            }, "#upload-button");
        }, "#upload-button");
    });

    it("should abort and retry while batch still in progress", () => {
        loadStory();

        interceptWithDelay(100);

        uploadFileTimes(fileName, () => {
            cy.get("button[data-test='abort-button']")
                .eq(1)
                .click();

            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });

            cy.get("button[data-test='retry-button']")
                .eq(1)
                .click();

            cy.wait(WAIT_OP_TIME);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            cy.storyLog().assertFileItemStartFinish("flower3.jpg");
            cy.storyLog().assertFileItemStartFinish("flower2.jpg");
        }, 3, "#upload-button");
    });

    it("should abort and retry after batch finished", () => {
        loadStory();
        interceptWithDelay(200);

        uploadFileTimes(fileName, () => {
            cy.get("button[data-test='abort-button']")
                .eq(1)
                .click();

            //wait until the other two files finished uploading
            cy.wait(WAIT_LONG);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            cy.storyLog().assertFileItemStartFinish("flower3.jpg");

            cy.get("button[data-test='retry-button']")
                .eq(1)
                .click();

            cy.wait(WAIT_SHORT);
            cy.storyLog().assertFileItemStartFinish("flower2.jpg");
        }, 3, "#upload-button");
    });
});
