import uploadFile from "../uploadFile";

describe("NativeUploady - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("nativeUploady", "simple");
    });

    it("should use native uploady", () => {
        uploadFile(fileName, () => {
            cy.wait(1500);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
