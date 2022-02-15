import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { BATCH_ADD, ITEM_START, ITEM_FINISH, ITEM_CANCEL } from "../storyLogPatterns";
import { WAIT_MEDIUM, WAIT_SHORT } from "../specWaitTimes";

describe("UploadPreview - Crop", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview", "with-crop&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url");
    });

    beforeEach(() => {
        cy.storyLog().resetStoryLog()
    });

    it("should show upload crop before upload", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.wait(WAIT_SHORT);

            cy.get("img.ReactCrop__image")
                .should("be.visible");

            cy.storyLog().assertLogPattern(BATCH_ADD);
            cy.storyLog().assertLogPattern(ITEM_START);
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });

            cy.get("#crop-btn").click();

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["file"]).to.eq(fileName);
                })
                .its("request.headers")
                .its("content-length")
                .then((length) => {
                    expect(parseInt(length)).to.be.lessThan(4000);

                    cy.storyLog().assertFileItemStartFinish(fileName, 1);
                });
        }, "#upload-btn");
    });

    it("should show crop and allow cancel", () => {
        uploadFile(fileName, () => {
            cy.wait(WAIT_SHORT);

            cy.get("img.ReactCrop__image")
                .should("be.visible");

            cy.storyLog().assertLogPattern(BATCH_ADD);
            cy.storyLog().assertLogPattern(ITEM_START);
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });

            cy.get("#cancel-btn").click();

            cy.storyLog().assertLogPattern(ITEM_CANCEL);
        }, "#upload-btn");
    });

    it("should show crop and allow upload original", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.wait(WAIT_SHORT);

            cy.get("img.ReactCrop__image")
                .should("be.visible");

            cy.storyLog().assertLogPattern(BATCH_ADD);
            cy.storyLog().assertLogPattern(ITEM_START);
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });

            cy.get("#full-btn").click();

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["file"]).to.eq("flower.jpg");
                })
                .its("request.headers")
                .its("content-length")
                .then((length) => {
                    expect(parseInt(length)).to.be.least(300000);
                });

            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        }, "#upload-btn");
    });

    it("should show fallback without crop", () => {
        uploadFile(fileName, () => {
            cy.wait(WAIT_SHORT);

            cy.get("img.ReactCrop__image")
                .should("not.exist");

            cy.get("#fallback-preview")
                .should("be.visible");

        }, "#upload-btn", { mimeType: "application/pdf" });
    });
});
