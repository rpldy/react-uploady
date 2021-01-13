import uploadFile from "../uploadFile";
import { ITEM_FINISH, ITEM_START } from "../storyLogPatterns";

describe("Uploady - autoUpload off tests", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "with-auto-upload-off&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url", true);
    });

    it("should process pending with options", () => {
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
