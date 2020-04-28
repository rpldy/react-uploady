import uploadFile from "../uploadFile";

describe("RetryHooks - Retry Upload", () => {
    const fileName = "flower.jpg",
        fileName2 = "sea.jpg";

    before(() => {
        cy.visitStory("retryHooks", "with-retry");
    });

    it("should retry batch", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        //create first batch
        uploadFile(fileName, () => {
            //create second batch
            uploadFile(fileName2, () => {

                cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 2 });
                cy.storyLog().assertLogPattern(/ITEM_CANCEL/, { times: 2 });

                cy.get("@iframe")
                    .find("li[data-test='batch-retry-0']")
                    .click();

                cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 3 });

                cy.wait(3000);

                cy.storyLog().assertLogPattern(/ITEM_FINISH/, { times: 1 });
            }, "#upload-button");
        }, "#upload-button");
    });
});
