import uploadFile from "../uploadFile";
import { BATCH_ADD, ITEM_START, ITEM_FINISH } from "../storyLogPatterns";

describe("Uploady - autoUpload off tests", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.reload();
    });

    before(() => {
        cy.visitStory("uploady", "with-auto-upload-off&knob-mock send delay_Upload Destination=200", true) //&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url", true);
    });

    it("should not auto upload", () => {
        uploadFile(fileName, () => {

            uploadFile(fileName, () => {
                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 2 });
                cy.wait(500);
                cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });
            }, "#upload-button", null);
        }, "#upload-button", null);
    });

    it("should process pending", () => {
        uploadFile(fileName, () => {
            uploadFile(fileName, () => {
                cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

                cy.get("#process-pending")
                    .click();

                cy.wait(500);

                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
            }, "#upload-button", null);
        }, "#upload-button", null);
    });

    it("should clear pending", () => {
        uploadFile(fileName, () => {
            cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

            cy.get("#clear-pending")
                .click();

            uploadFile(fileName, () => {
                cy.get("#process-pending")
                    .click();

                cy.wait(500);

                cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
            }, "#upload-button", null);
        }, "#upload-button", null);
    });

    it("should process pending with options", () => {
        cy.visitStory("uploady", "with-auto-upload-off&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url", true);

        cy.server();

        cy.route({
            method: "POST",
            url: "http://test.upload/url",
            response: { success: true }
        }).as("uploadReq");

        uploadFile(fileName, () => {
            cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

            cy.get("#process-pending-param")
                .click();

            cy.wait(500);

            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });

            cy.wait("@uploadReq")
                .its("request.body")
                .should((body) => {
                    expect(body.get("test")).to.equal("123");
                });

        }, "#upload-button", null);
    });
});
