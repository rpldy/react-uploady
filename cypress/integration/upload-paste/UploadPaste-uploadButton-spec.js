import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { WAIT_X_SHORT } from "../../constants";

describe("UploadPaste - Wrap Upload-Button", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadPaste",
            "with-paste-upload-button",
            { useMock: false }
        );
    });

    it("should upload pasted file from upload-button", () => {
        intercept();

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
            cy.storyLog().assertFileItemStartFinish(fileName, 5);
        }, "#upload-button");
    });
});
