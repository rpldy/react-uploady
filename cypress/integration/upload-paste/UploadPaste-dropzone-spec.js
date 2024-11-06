import intercept from "../intercept";
import dropFile from "../dropFile";

describe("UploadPaste - Wrap Upload-DropZone", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory(
            "uploadPaste",
            "with-paste-drop-zone",
            { useMock: false }
        );
    });

    it("drop should continue working on wrapped drop-zone", () => {
        intercept();

        dropFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["test"]).to.eq("paste");
                });

            cy.waitExtraShort();
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });

    it("should upload file pasted to wrapper drop-zone", () => {
        intercept();
        //need to give time for storybook decorator to update the args from the url...
        cy.waitMedium();

        cy.get("#upload-drop-zone")
            .pasteFile(fileName);

        cy.wait("@uploadReq")
            .interceptFormData((formData) => {
                expect(formData["test"]).to.eq("paste");
            });

        cy.waitExtraShort();
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });
});
