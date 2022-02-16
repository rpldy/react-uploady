import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { WAIT_X_SHORT } from "../specWaitTimes";

describe("UploadPaste - Wrap Upload-Button", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadPaste",
            "with-paste-upload-button",
            { useMock: true }
        );
    });

    it("should upload pasted file from upload-button", () => {
        intercept("http://test.upload/url");

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["test"]).to.eq("paste");
                });

            cy.wait(WAIT_X_SHORT);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            cy.get("#upload-button")
                .pasteFile(fileName);

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["test"]).to.eq("paste");
                });

            cy.wait(WAIT_X_SHORT);
            cy.storyLog().assertFileItemStartFinish(fileName, 4);
        }, "#upload-button");
    });
});
