import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("UploadPaste - Wrap Upload-Button", () => {
    const fileName = "flower.jpg";

    const loadPage = () =>
        cy.visitStory(
            "uploadPaste",
            "with-paste-upload-button",
            { useMock: false }
        );

    it("should upload pasted file from upload-button", () => {
        loadPage();
        intercept();

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["test"]).to.eq("paste");
                });

            cy.waitExtraShort();
            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            cy.waitExtraShort();
            cy.get("#upload-button")
                .pasteFile(fileName);

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["test"]).to.eq("paste");
                });

            cy.waitExtraShort();
            cy.storyLog().assertFileItemStartFinish(fileName, 5);
        }, "#upload-button");
    });
});
