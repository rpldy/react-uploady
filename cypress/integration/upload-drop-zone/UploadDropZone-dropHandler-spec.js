import dropFile from "../dropFile";

describe("UploadDropZone - Drop Handler", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadDropZone", "with-drop-handler");
    });

    it("should upload result from drop handler", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        dropFile(fileName, () => {
            cy.wait(2000);
            cy.storyLog().assertUrlItemStartFinish("https://i.pinimg.com/originals/51/bf/9c/51bf9c7fdf0d4303140c4949afd1d7b8.jpg", 1);
        });
    });
});
