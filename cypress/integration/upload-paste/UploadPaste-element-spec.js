import intercept from "../intercept";
import { ITEM_START } from "../../constants";

describe("UploadPaste - Element Listener", () => {
    const fileName = "flower.jpg";

    const visitStory = () =>
        cy.visitStory(
            "uploadPaste",
            "with-element-paste",
            { useMock: false }
        );

    it("should upload pasted file from element only", () => {
        visitStory();
        intercept();

        //shouldnt trigger upload
        cy.get("body")
            .pasteFile(fileName);

        cy.waitLong();

        //should trigger upload
        cy.get("#element-paste")
            .pasteFile(fileName);

        cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });
        // cy.storyLog().assertLogPattern(BATCH_ADD, { times: 1 });

        cy.get("#process-pending")
            .click();

        cy.wait("@uploadReq")
            .interceptFormData((formData) => {
                expect(formData["test"]).to.eq("paste");
            });

        cy.waitExtraShort();
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });
});
