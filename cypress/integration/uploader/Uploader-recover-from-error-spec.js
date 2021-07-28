import uploadFile from "../uploadFile";
import { ITEM_START, ITEM_ERROR } from "../storyLogPatterns";

describe("Uploader - recover from sender error test", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploader", "with-custom-ui&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=");
    });

    it("should upload again after unexpected sender error", () => {
        uploadFile(fileName, () => {
            uploadFile(fileName, () => {
                cy.wait(1000);

                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_ERROR, { times: 2 });
            }, "#upload-button");
        }, "#upload-button");
    });
});
