import intercept from "../intercept";
import dropFile from "../dropFile";

describe("UploadPaste - Wrap Upload-DropZone", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPaste", "with-paste-drop-zone&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url");
    });

    beforeEach(() => {
        cy.storyLog().resetStoryLog()
    });

    it("drop should continue working on wrapped drop-zone", () => {
        intercept("http://test.upload/url");

        dropFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["test"]).to.eq("paste");
                });

            cy.wait(200);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });

    it("should upload file pasted to wrapper drop-zone", () => {
        intercept("http://test.upload/url");

        cy.get("#upload-drop-zone")
            .pasteFile(fileName);

        cy.wait("@uploadReq")
            .interceptFormData((formData) => {
                expect(formData["test"]).to.eq("paste");
            });

        cy.wait(200);
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });
});
