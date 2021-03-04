import dropFile from "../dropFile";

describe("UploadDropZone - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadDropZone", "simple&knob-mock send delay_Upload Destination=100");
    });

    it("should upload dropped file", () => {
        dropFile(fileName, () => {
            cy.wait(200);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
