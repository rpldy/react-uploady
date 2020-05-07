import { uploadFileTimes } from "../uploadFile";

describe("UploadPreview - Simple - Multiple files", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview", "simple");
    });

    it("should show upload preview for multiple files", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        uploadFileTimes(fileName, () => {
            cy.get("@iframe")
                .find("img[data-test='upload-preview']")
                .should("be.visible")
                .should("have.length", 3)
                .invoke("attr", "src")
                .should("match", /blob:/)
        }, 3);
    });
});
