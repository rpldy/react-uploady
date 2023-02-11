import intercept from "../intercept";
import dropFile from "../dropFile";
import { WAIT_X_SHORT } from "../../constants";

describe("UploadPaste - Wrap Upload-DropZone", () => {
    const fileName = "flower.jpg";

    const loadPage = () =>
        cy.visitStory(
            "uploadPaste",
            "with-paste-drop-zone",
            { useMock: false }
        );

    it("drop should continue working on wrapped drop-zone", () => {
        loadPage();
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
        loadPage();
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
