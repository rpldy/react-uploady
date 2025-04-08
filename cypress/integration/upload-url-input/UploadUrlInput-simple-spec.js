import uploadFile from "../uploadFile";

describe("UploadButton - Simple", () => {
	const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadUrlInput",
            "simple",
            { mockDelay: 100 }
        );
    });

	it("should use uploady", () => {
		cy.get("input#url-input")
                .should("exist")
            .type("http://test.com{enter}");

			cy.waitShort();
			cy.storyLog().assertFileItemStartFinish(fileName, 1);
	});
});
