import uploadFile from "../uploadFile";

describe("Uploader - recover from sender error test", () => {

    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploader", "with-custom-ui&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=", true);
    });

    it("should upload again after unexpected sender error", () => {

        uploadFile(fileName, () => {
            cy.wait(2000);

            uploadFile(fileName, () => {
                cy.wait(2000);

                cy.storyLog().assertLogPattern(/ITEM_START/, { times: 2 });
                cy.storyLog().assertLogPattern(/ITEM_ERROR/, { times: 2 });

                }, "#upload-button", null);
        }, "#upload-button", null);

    });
});
