import uploadFile from "../uploadFile";

describe("NativeUploady - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("nativeUploady", "simple", true);
    });


    it("should use native uploady", () => {
        uploadFile(fileName, () => {
            cy.wait(2000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        }, "button", null);
    });
});
