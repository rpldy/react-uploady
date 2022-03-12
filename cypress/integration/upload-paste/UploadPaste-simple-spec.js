import { WAIT_MEDIUM } from "../../constants";

describe("UploadPaste - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPaste", "simple&knob-mock send delay_Upload Destination=100");
    });

    beforeEach(() => {
        //refresh UI And cypress log
        cy.reload();
    });

    it("should upload pasted file", () => {
        cy.get("#paste-area")
            .should("exist")
            .pasteFile(fileName);

         cy.wait(WAIT_MEDIUM);
         cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });

    it("should upload pasted files", () => {
        cy.get("#paste-area")
            .should("exist")
            .pasteFile(fileName, 2);

        cy.wait(WAIT_MEDIUM);
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
        cy.storyLog().assertFileItemStartFinish("flower2.jpg", 3);
    });
});
