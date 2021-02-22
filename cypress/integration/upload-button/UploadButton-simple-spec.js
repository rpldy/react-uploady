import uploadFile from "../uploadFile";

describe("UploadButton - Simple", () => {
	const fileName = "flower.jpg";

	before(() => {
		cy.visitStory("uploadButton", "simple");
	});

	it("should use uploady", () => {
		cy.get("input")
			.should("exist")
			.as("fInput");

		uploadFile(fileName, () => {
			cy.wait(1500);
			cy.storyLog().assertFileItemStartFinish(fileName, 1);
		}, "button");
	});
});
