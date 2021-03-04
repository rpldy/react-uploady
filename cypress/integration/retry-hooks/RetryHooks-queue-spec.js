import uploadFile, { uploadFileTimes } from "../uploadFile";

describe("RetryHooks - Queue", () => {
    const fileName = "flower.jpg",
        fileName2 = "sea.jpg";

    before(() => {
        cy.visitStory("retryHooks", "with-retry-and-preview&knob-mock send delay_Upload Destination=500");
    });

    it("should use queue with retry", () => {
        uploadFile(fileName, () => {
            uploadFile(fileName2, () => {
                cy.wait(400);
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

                cy.wait(1500);

                cy.get("@secondArticle")
                    .find("button[data-test='abort-button']")
                    .should("be.disabled");

                cy.get("@secondArticle")
                    .find("button[data-test='retry-button']")
                    .should("be.disabled");

                cy.storyLog().assertFileItemStartFinish(fileName, 1);
                cy.storyLog().assertFileItemStartFinish(fileName2, 7);

                cy.get("button[data-test='queue-clear-button']")
                    .click();

                cy.get("article[data-test='preview-item-container']")
                    .should("have.length", 0);

            }, "#upload-button");
        }, "#upload-button");
    });

    it("should abort and retry while batch still in progress", () => {
        //reload to clear story log from window
        cy.reload();

        uploadFileTimes(fileName, () => {
            cy.get("button[data-test='abort-button']")
                .eq(1)
                .click();

            cy.storyLog().assertLogPattern(/ITEM_ABORT/, { times: 1 });

            cy.get("button[data-test='retry-button']")
                .eq(1)
                .click();

            cy.wait(3000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            cy.storyLog().assertFileItemStartFinish("flower3.jpg", 5);
            cy.storyLog().assertFileItemStartFinish("flower2.jpg", 7);
        }, 3, "#upload-button");
    });

    it("should abort and retry after batch finished", () => {
        cy.reload();

        uploadFileTimes(fileName, () => {
            cy.get("button[data-test='abort-button']")
                .eq(1)
                .click();

            cy.wait(2000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            cy.storyLog().assertFileItemStartFinish("flower3.jpg", 4);

            cy.get("button[data-test='retry-button']")
                .eq(1)
                .click();

            cy.wait(500);
            cy.storyLog().assertFileItemStartFinish("flower2.jpg", 7);
        }, 3, "#upload-button");
    });
});
