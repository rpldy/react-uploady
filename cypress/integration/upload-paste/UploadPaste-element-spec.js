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

    it("should upload pasted file from element only", () => {
        loadPage();
        intercept();

        //shouldnt trigger upload
        cy.get("body")
            .pasteFile(fileName);

        //story uses autoUpload=false so shouldnt trigger upload, but should add to queue
        cy.get("#element-paste")
            .pasteFile(fileName);

        cy.waitLong();

        cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

        cy.get("#process-pending")
            .click();

        cy.waitLong();

        cy.wait("@uploadReq")
            .interceptFormData((formData) => {
                expect(formData["test"]).to.eq("paste");
            });

        cy.waitExtraShort();
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });
});
