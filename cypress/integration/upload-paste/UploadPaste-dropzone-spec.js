import intercept from "../intercept";
import dropFile from "../dropFile";
import { WAIT_X_SHORT } from "../specWaitTimes";

describe("UploadPaste - Wrap Upload-DropZone", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadPaste",
            "with-paste-drop-zone",
            { useMock: false }
        );
    });

    beforeEach(() => {
        cy.storyLog().resetStoryLog()
    });

    it("drop should continue working on wrapped drop-zone", () => {
        intercept();

        dropFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["test"]).to.eq("paste");
                });

            cy.wait(WAIT_X_SHORT);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });

    it("should upload file pasted to wrapper drop-zone", () => {
        intercept();

        cy.get("#upload-drop-zone")
            .pasteFile(fileName);

        cy.wait("@uploadReq")
            .interceptFormData((formData) => {
                expect(formData["test"]).to.eq("paste");
            });

        cy.wait(WAIT_X_SHORT);
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });
});
