import dropFile from "../dropFile";

describe("UploadDropZone - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadDropZone", "simple");
    });

    it("should upload dropped file", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        dropFile(fileName, () => {
            cy.wait(2000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
