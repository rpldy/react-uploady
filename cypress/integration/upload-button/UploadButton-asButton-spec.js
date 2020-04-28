import uploadFile from "../uploadFile";

describe("With Component asButton", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-component-as-button");
    });

    it("should make any custom component an upload button", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        uploadFile(fileName, () => {
            cy.wait(2000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        }, "#div-upload");
    });
});
