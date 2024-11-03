import { uploadFileTimes } from "../uploadFile";

describe("UploadButton - Simple - Multiple files", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadButton",
            "simple",
            { mockDelay: 100 }
        );
    });

    it("should use uploady to upload multiple files", () => {
        cy.get("input")
            .should("exist")
            .as("fInput");

        uploadFileTimes(fileName, () => {
            cy.waitMedium();

            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            cy.storyLog().assertFileItemStartFinish("flower2.jpg", 3);
            cy.storyLog().assertFileItemStartFinish("flower3.jpg", 5);
        }, 3);
    });
});
