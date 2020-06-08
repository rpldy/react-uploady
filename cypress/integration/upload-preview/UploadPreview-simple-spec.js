import uploadFile from "../uploadFile";

describe("UploadPreview - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview", "simple");
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
					.should("have.length", 1);
			});
        });
    });
});
