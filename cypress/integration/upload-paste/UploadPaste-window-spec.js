import { WAIT_X_SHORT } from "../../constants";

describe("UploadPaste - Window Listener", () => {
    const fileName = "flower.jpg";

    const loadPage = () =>
        cy.visitStory(
            "uploadPaste",
            "with-window-paste&knob-mock send delay_Upload Destination=100",
        );

    it("should upload pasted file from anywhere on the page", () => {
        loadPage();
        //wait for body to render first
        cy.get("#storybook-root button")

        cy.get("body")
            .pasteFile(fileName);

        cy.wait(WAIT_X_SHORT);
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });
});
