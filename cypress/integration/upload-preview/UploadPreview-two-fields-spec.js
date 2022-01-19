import uploadFile from "../uploadFile";
import intercept from "../intercept";

describe("UploadPreview - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview", "with-two-fields&knob-destination_Upload Destination=local");
    });

    it("should show previews in appropriate field", () => {
        intercept("http://localhost:4000/upload");

        uploadFile(fileName, () => {
            uploadFile(fileName, () => {
                cy.get(".upload-field-0 img").should("have.length", 1);
                cy.get(".upload-field-1 img").should("have.length", 1);

                cy.wait("@uploadReq")
                    .interceptFormData((formData) => {
                        expect(formData["uploadType"]).to.eq("IMAGES");
                    });

                cy.wait("@uploadReq")
                    .interceptFormData((formData) => {
                        expect(formData["uploadType"]).to.eq("DOCUMENTS");
                    });
            }, ".upload-field-1 .upload-button");
        }, ".upload-field-0 .upload-button");
    });
});
