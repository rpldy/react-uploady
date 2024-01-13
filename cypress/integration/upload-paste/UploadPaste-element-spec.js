import intercept from "../intercept";
import { ITEM_START } from "../../constants";

describe("UploadPaste - Element Listener", () => {
    const fileName = "flower.jpg";

    const loadPage = () =>
        cy.visitStory(
            "uploadPaste",
            "with-element-paste",
            { useMock: false }
        );

    it.skip("should upload pasted file from element only", () => {
        loadPage();
        intercept();

        //shouldnt trigger upload
        cy.get("body")
            .pasteFile(fileName);

        //should trigger upload
        cy.get("#element-paste")
            .pasteFile(fileName);

        cy.waitExtraShort();

        cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

        cy.get("#process-pending")
            .click();

        cy.waitShort();

        cy.wait("@uploadReq")
            .interceptFormData((formData) => {
                expect(formData["test"]).to.eq("paste");
            });

        cy.waitExtraShort();
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });
});
