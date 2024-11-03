import uploadFile from "../uploadFile";

describe("UploadButton - Simple", () => {
	const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadButton",
            "simple",
            { mockDelay: 100 }
        );
    });

	it("should use uploady", () => {
		cy.get("input")
			.should("exist")
			.as("fInput");

		uploadFile(fileName, () => {
			cy.waitShort();
			cy.storyLog().assertFileItemStartFinish(fileName, 1);
		}, "button");
	});
});
