import uploadFile from "../uploadFile";

describe("UploadPreview - Clear", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview", "with-preview-methods");
    });

    it("should show upload preview", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

		uploadFile(fileName, () => {
			uploadFile(fileName, () => {

				cy.get("@iframe")
					.find("img[data-test='upload-preview']")
					.should("be.visible")
					.invoke("attr", "src")
					.should("match", /blob:/);

				cy.get("@iframe")
					.find("img[data-test='upload-preview']")
					.should("not.have.length", 2);

				cy.get("@iframe")
					.find("#clear-btn")
					.should("have.text", "Clear 2 previews")
					.click();

				cy.get("@iframe")
					.get("img[data-test='upload-preview']")
					.should("have.length", 0);
			}, "#upload-btn");
		}, "#upload-btn");
    });
});
