import uploadFile from "../uploadFile";

describe("RetryHooks - Retry Upload", () => {
    const fileName = "flower.jpg",
        fileName2 = "sea.jpg";

    before(() => {
        cy.visitStory("retryHooks", "with-retry", true);
    });

    it("should retry batch", () => {
        //create first batch
        uploadFile(fileName, () => {
            //create second batch
            uploadFile(fileName2, () => {
                cy.wait(1000);

                cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 2 });
                cy.storyLog().assertLogPattern(/ITEM_ABORT/, { times: 2 });

                cy.get("li[data-test='item-retry-0']")
                    .click();

                cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 3 });

                cy.wait(3000);

                cy.storyLog().assertLogPattern(/ITEM_FINISH/, { times: 1 });
            }, "#upload-button", null);
        }, "#upload-button", null);
    });
});
