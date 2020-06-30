import uploadFile from "../uploadFile";

describe("RetryHooks - Queue", () => {
	const fileName = "flower.jpg",
		fileName2 = "sea.jpg";

	before(() => {
		cy.visitStory("retryHooks", "with-retry-and-preview", true);
	});

	it("should use queue with retry", () => {
		uploadFile(fileName, () => {
			uploadFile(fileName2, () => {
				cy.wait(1000);
				cy.get("button[data-test='abort-button']:last")
					.click();

				cy.get("article[data-test='preview-item-container']")
					.should("have.length", 2);

				cy.get("article[data-test='preview-item-container']:first")
					.as("firstArticle")
					.should("have.data", "state", "DONE");

				cy.get("@firstArticle")
					.find("button[data-test='retry-button']")
					.should("be.disabled");

				cy.get("@firstArticle")
					.find("button[data-test='abort-button']")
					.should("be.disabled");

				cy.get("article[data-test='preview-item-container']:last")
					.as("secondArticle")
					.should("have.data", "state", "ABORTED");

				cy.get("@secondArticle")
					.find("button[data-test='abort-button']")
					.should("be.disabled");

				cy.get("@secondArticle")
					.find("button[data-test='retry-button']")
					.click();

				cy.wait(500);

				cy.get("@secondArticle")
					.find("button[data-test='abort-button']")
					.should("be.disabled");

				cy.get("@secondArticle")
					.find("button[data-test='retry-button']")
					.should("be.disabled");

				cy.storyLog().assertFileItemStartFinish(fileName, 1);
				cy.storyLog().assertFileItemStartFinish(fileName2, 7);

				cy.get("button[data-test='queue-clear-button']")
					.click();

				cy.get("article[data-test='preview-item-container']")
					.should("have.length", 0);

			}, "#upload-button", null);
		}, "#upload-button", null);
	});
});
