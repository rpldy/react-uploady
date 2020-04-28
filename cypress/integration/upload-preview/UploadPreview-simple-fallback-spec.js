import uploadFile from "../uploadFile";

describe("UploadPreview - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview", "simple&knob-preview max image size_Upload Settings=1000");
    });

    it("should show fallback on image > max size", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        uploadFile(fileName, () => {
            cy.get("@iframe")
                .find("img[data-test='upload-preview']")
                .should("be.visible")
                .invoke("attr", "src")
                .should("match", /https:\/\/icon-library.net\/images/);
        });
    });
});
