import intercept from "../intercept";
import { ITEM_START } from "../storyLogPatterns";
import { WAIT_X_SHORT } from "../specWaitTimes";

describe("UploadPaste - Element Listener", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPaste", "with-element-paste&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url");
    });

    it("should upload pasted file from element only", () => {
        intercept("http://test.upload/url");

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
