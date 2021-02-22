import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("UploadButton - Form", () => {
    const fileName = "flower.jpg",
        fileName2 = "sea.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-form&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url");
    });

    it("should submit form with upload and other fields", () => {
        intercept();

        cy.get("#field-name")
            .type("james");

        cy.get("#field-age")
            .type("22");

        uploadFile(fileName, () => {
            uploadFile(fileName2, () => {
                cy.get("#form-submit")
                    .click();

                cy.wait("@uploadReq")
                    .interceptFormData((formData) => {
                        expect(formData["field-name"]).to.eq("james");
                        expect(formData["field-age"]).to.eq("22");
                        expect(formData["file"]).to.eq(fileName2);

                        cy.storyLog().assertLogPattern(/ITEM_FINISH/, { times: 1 });
                    });

            }, "#form-upload-button");
        }, "#form-upload-button");
    });
});
