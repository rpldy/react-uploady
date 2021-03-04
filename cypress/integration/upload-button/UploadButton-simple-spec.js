import uploadFile from "../uploadFile";

describe("UploadButton - Simple", () => {
	const fileName = "flower.jpg";

	before(() => {
		cy.visitStory("uploadButton", "simple&knob-mock send delay_Upload Destination=100");
	});

	it("should use uploady", () => {
		cy.get("input")
			.should("exist")
			.as("fInput");

		uploadFile(fileName, () => {
			cy.wait(200);
			cy.storyLog().assertFileItemStartFinish(fileName, 1);
		}, "button");
	});
});
