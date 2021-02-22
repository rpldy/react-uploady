import uploadFile from "../uploadFile";

describe("UploadPreview - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview", "simple");
    });

    it("should show upload preview", () => {
        uploadFile(fileName, () => {
            uploadFile(fileName, () => {
				cy.get("img[data-test='upload-preview']")
					.should("be.visible")
					.invoke("attr", "src")
					.should("match", /blob:/);

				cy.get("img[data-test='upload-preview']")
					.should("have.length", 1);
			}, "button");
        }, "button");
    });
});
