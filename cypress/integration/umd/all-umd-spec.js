import intercept, { RESPONSE_DEFAULTS } from "../intercept";
import uploadFile from "../uploadFile";
import { BATCH_ADD, ITEM_START, UPLOAD_URL } from "../../constants";

describe("UMD ALL - Bundle", () => {
    const fileName = "flower.jpg";

    it("should use Uploady and UploadButton to upload file", () => {
        cy.visitStory("uploady", "umd-all");

        cy.intercept("POST", UPLOAD_URL, () => {
            return RESPONSE_DEFAULTS;
        }).as("umdUpload");

        uploadFile(fileName, () => {
            cy.waitLong();
            cy.wait("@umdUpload")
                .interceptFormData((formData) => {
                    expect(formData["file"]).to.eq(fileName);
                })
                .its("response.statusCode")
                .should("eq", 200);

            cy.storyLog().assertLogPattern(BATCH_ADD, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });

            cy.get("img[data-test='upload-preview']")
                .should("be.visible")
                .invoke("attr", "src")
                .should("match", /blob:/);
        }, "#upload-button");
    });
});
