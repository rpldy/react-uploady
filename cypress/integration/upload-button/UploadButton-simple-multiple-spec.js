import { uploadFileTimes } from "../uploadFile";

describe("UploadButton - Simple - Multiple files", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "simple");
    });

    it("should use uploady to upload multiple files", () => {
        cy.get("input")
            .should("exist")
            .as("fInput");

        uploadFileTimes(fileName, () => {
            cy.wait(1000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            cy.wait(1000);
            cy.storyLog().assertFileItemStartFinish("flower2.jpg", 3);
            cy.wait(1000);
            cy.storyLog().assertFileItemStartFinish("flower3.jpg", 5);
        }, 3, "button");
    });
});
