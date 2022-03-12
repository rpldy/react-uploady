import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { BATCH_ADD } from "../../constants";

describe("UploadPreview - Crop in Form", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview",
            "with-crop-in-form",
            { useMock: false }
        );
    });

    it("should submit cropped image with form", () => {
        intercept();

        uploadFile(fileName, () => {
            //click preview to open crop
            cy.get(".preview-thumb").click();

            cy.get("img.ReactCrop__image")
                .should("be.visible");

            cy.storyLog().assertLogPattern(BATCH_ADD);

            cy.get("#save-crop-btn").click();

            cy.get("#field-name")
                .type("james");

            cy.get("#field-age")
                .type("22");

            //submit the upload/form
            cy.get("#submit-button").click();

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["field-name"]).to.eq("james");
                    expect(formData["field-age"]).to.eq("22");
                    expect(formData["file"]).to.eq(fileName);
                })
                .its("request.headers")
                .its("content-length")
                .then((length) => {
                    expect(parseInt(length)).to.be.lessThan(5000);

                    cy.storyLog().assertFileItemStartFinish(fileName, 1);
                });
        }, "#upload-button");
    });
});
