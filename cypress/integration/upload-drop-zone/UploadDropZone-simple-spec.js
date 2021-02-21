import dropFile from "../dropFile";

describe("UploadDropZone - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadDropZone", "simple");
    });

    it("should upload dropped file", () => {
        dropFile(fileName, () => {
            cy.wait(1000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
