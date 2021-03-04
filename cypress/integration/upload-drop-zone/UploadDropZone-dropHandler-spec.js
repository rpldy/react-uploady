import dropFile from "../dropFile";

describe("UploadDropZone - Drop Handler", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadDropZone", "with-drop-handler&knob-mock send delay_Upload Destination=100");
    });

    it("should upload result from drop handler", () => {
        dropFile(fileName, () => {
            cy.wait(200);
            cy.storyLog().assertUrlItemStartFinish("https://i.pinimg.com/originals/51/bf/9c/51bf9c7fdf0d4303140c4949afd1d7b8.jpg", 1);
        });
    });
});
