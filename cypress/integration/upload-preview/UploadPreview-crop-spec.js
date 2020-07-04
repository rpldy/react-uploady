import uploadFile from "../uploadFile";
import { BATCH_ADD, ITEM_START, ITEM_FINISH, ITEM_CANCEL } from "../storyLogPatterns";

describe("UploadPreview - Crop", () => {
	const fileName = "flower.jpg";

	before(() => {
		cy.visitStory("uploadPreview", "with-crop&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url", true);
	});

	beforeEach(() => {
		cy.storyLog().resetStoryLog()
	});

	it("should show upload crop before upload", () => {
		cy.server();

		cy.route({
			method: "POST",
			url: "http://test.upload/url",
			response: { success: true }
		}).as("uploadReq");

		uploadFile(fileName, () => {
			cy.wait(500);

			cy.get("img.ReactCrop__image")
				.should("be.visible");

			cy.storyLog().assertLogPattern(BATCH_ADD);
			cy.storyLog().assertLogPattern(ITEM_START);
			cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });

			cy.get("#crop-btn").click();

			cy.wait("@uploadReq")
				.its("request.body")
				.should((body) => {
					assert.isAtMost(body.get("file").size, 1000, "file size should be much smaller because its cropped");
					expect(body.get("file").name).to.eq("flower.jpg");
				});

			cy.storyLog().assertFileItemStartFinish(fileName, 1);
		}, "#upload-btn", null);
	});

	it("should show crop and allow cancel", () => {
		uploadFile(fileName, () => {
			cy.wait(500);

			cy.get("img.ReactCrop__image")
				.should("be.visible");

			cy.storyLog().assertLogPattern(BATCH_ADD);
			cy.storyLog().assertLogPattern(ITEM_START);
			cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });

			cy.get("#cancel-btn").click();

			cy.storyLog().assertLogPattern(ITEM_CANCEL);
		}, "#upload-btn", null);
	});

	it("should show crop and allow upload original", () => {
		cy.server();

		cy.route({
			method: "POST",
			url: "http://test.upload/url",
			response: { success: true }
		}).as("uploadReq");

		uploadFile(fileName, () => {
			cy.wait(500);

			cy.get("img.ReactCrop__image")
				.should("be.visible");

			cy.storyLog().assertLogPattern(BATCH_ADD);
			cy.storyLog().assertLogPattern(ITEM_START);
			cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });

			cy.get("#full-btn").click();

			cy.wait("@uploadReq")
				.its("request.body")
				.should((body) => {
					assert.isAtLeast(body.get("file").size, 300000, "file size should be original");
					expect(body.get("file").name).to.eq("flower.jpg");
				});

			cy.storyLog().assertFileItemStartFinish(fileName, 1);
		}, "#upload-btn", null);
	});
});