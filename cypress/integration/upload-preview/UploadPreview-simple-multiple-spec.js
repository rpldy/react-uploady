import { uploadFileTimes } from "../uploadFile";

describe("UploadPreview - Simple - Multiple files", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview", "simple");
    });

    it("should show upload preview for multiple files", () => {
        uploadFileTimes(fileName, () => {
            cy.waitShort();
            cy.get("img[data-test='upload-preview']")
                .should("be.visible")
                .should("have.length", 3)
                .invoke("attr", "src")
                .should("match", /blob:/);
        }, 3, "button");
    });
});
