import uploadFile from "../uploadFile";

describe("RetryHooks - Retry Upload", () => {
    const fileName = "flower.jpg",
        fileName2 = "sea.jpg";

    before(() => {
        cy.visitStory("retryHooks", "with-retry"); //&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url&knob-chunk size (bytes)_Upload Settings=50000");
    });

    it("should retry all failed uploads", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        //create first batch
        uploadFile(fileName, () => {
            //create second batch
            uploadFile(fileName2, () => {

                cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 2 });
                cy.storyLog().assertLogPattern(/ITEM_START/, { times: 2 });
                cy.storyLog().assertLogPattern(/ITEM_CANCEL/, { times: 2 });

                cy.get("@iframe")
                    .find("#retry-all")
                    .should("be.visible")
                    .click();

                cy.wait(3000);

                cy.storyLog().assertLogPattern(/ITEM_FINISH/, { times: 2 });
            }, "#upload-button");
        }, "#upload-button");
    });
});
