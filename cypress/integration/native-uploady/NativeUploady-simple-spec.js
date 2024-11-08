import uploadFile from "../uploadFile";

describe("NativeUploady - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "nativeUploady",
            "simple",
            { mockDelay: 100 }
        );
    });

    it("should use native uploady", () => {
        uploadFile(fileName, () => {
            cy.waitExtraShort();
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
