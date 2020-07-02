import uploadFile from "../uploadFile";

describe("UploadPreview - Clear", () => {
	const fileName = "flower.jpg";

	before(() => {
		cy.visitStory("uploadPreview", "with-preview-methods", true);
	});

	it("should show upload preview", () => {
		uploadFile(fileName, () => {
			uploadFile(fileName, () => {

				cy.get("img[data-test='upload-preview']")
					.should("be.visible")
					.invoke("attr", "src")
					.should("match", /blob:/);

				cy.get("img[data-test='upload-preview']")
					.should("not.have.length", 2);

				cy.get("#clear-btn")
					.should("have.text", "Clear 2 previews")
					.click();

				cy.get("img[data-test='upload-preview']")
					.should("have.length", 0);
			}, "#upload-btn", null);
		}, "#upload-btn", null);
	});
});
