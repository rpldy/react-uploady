import uploadFile from "../uploadFile";
import intercept from "../intercept";

describe("UploadPreview - Simple", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory(
            "uploadPreview",
            "with-two-fields",
            { useMock: false }
        );
    });

    it("should show previews in appropriate field", () => {
        intercept();

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
