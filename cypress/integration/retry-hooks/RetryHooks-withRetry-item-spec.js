import uploadFile from "../uploadFile";

describe("RetryHooks - Retry Upload", () => {
    const fileName = "flower.jpg",
        fileName2 = "sea.jpg";

    before(() => {
        cy.visitStory("retryHooks", "with-retry&knob-mock send delay_Upload Destination=100");
    });

    it("should retry batch", () => {
        //create first batch
        uploadFile(fileName, () => {
            //create second batch
            uploadFile(fileName2, () => {
                cy.wait(200);

                cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 2 });
                cy.storyLog().assertLogPattern(/ITEM_ABORT/, { times: 2 });

                cy.get("li[data-test='item-retry-0']")
                    .click();

                cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 3 });

                cy.wait(200);

                cy.storyLog().assertLogPattern(/ITEM_FINISH/, { times: 1 });
            }, "#upload-button");
        }, "#upload-button");
    });
});
