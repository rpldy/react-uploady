import uploadFile from "../uploadFile";

describe("NativeUploady - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("nativeUploady", "simple&knob-mock send delay_Upload Destination=100");
    });

    it("should use native uploady", () => {
        uploadFile(fileName, () => {
            cy.wait(200);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
