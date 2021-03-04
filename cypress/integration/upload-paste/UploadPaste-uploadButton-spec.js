import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("UploadPaste - Wrap Upload-Button", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPaste", "with-paste-upload-button&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url");
    });

    it("should upload pasted file from upload-button", () => {
        intercept("http://test.upload/url");

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["test"]).to.eq("paste");
                });

            cy.wait(200);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            cy.get("#upload-button")
                .pasteFile(fileName);

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["test"]).to.eq("paste");
                });

            cy.wait(200);
            cy.storyLog().assertFileItemStartFinish(fileName, 4);
        }, "#upload-button");
    });
});
