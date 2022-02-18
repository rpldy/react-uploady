import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { ITEM_FINISH, ITEM_START } from "../storyLogPatterns";

describe("Uploady - autoUpload off tests", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploady",
            "with-auto-upload-off",
            { useMock: false }
        );
    });

    it("should process pending with options", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

            cy.get("#process-pending-param")
                .click();

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                   expect(formData["test"]).to.equal("123");
                });

            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
        }, "#upload-button");
    });
});
