import dropFile from "../dropFile";

describe("UploadDropZone - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadDropZone", "simple", { mockDelay: 100 });
    });

    it("should upload dropped file", () => {
        dropFile(fileName, () => {
            cy.waitExtraShort();
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
