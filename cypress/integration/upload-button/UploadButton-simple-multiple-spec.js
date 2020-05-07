import { uploadFileTimes } from "../uploadFile";

describe("UploadButton - Simple - Multiple files", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "simple");
    });

    it("should use uploady to upload multiple files", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.get("@iframe")
            .find("input")
            .should("exist")
            .as("fInput");

        uploadFileTimes(fileName, () => {
            cy.wait(2000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            cy.wait(500);
            cy.storyLog().assertFileItemStartFinish("flower2.jpg", 3);
            cy.wait(500);
            cy.storyLog().assertFileItemStartFinish("flower3.jpg", 5);

        }, 3);
    });
});
