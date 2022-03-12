import intercept from "../intercept";
import { ITEM_START } from "../../constants";
import { WAIT_X_SHORT } from "../../constants";

describe("UploadPaste - Element Listener", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadPaste",
            "with-element-paste",
            { useMock: false }
        );
    });

    it("should upload pasted file from element only", () => {
        intercept();

        //shouldnt trigger upload
        cy.get("body")
            .pasteFile(fileName);

        //should trigger upload
        cy.get("#element-paste")
            .pasteFile(fileName);

        cy.wait(WAIT_X_SHORT);

        cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

        cy.get("#process-pending")
            .click();

        cy.wait("@uploadReq")
            .interceptFormData((formData) => {
                expect(formData["test"]).to.eq("paste");
            });

        cy.wait(WAIT_X_SHORT);
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });
});
