describe("UploadPaste - Window Listener", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPaste", "with-window-paste&knob-mock send delay_Upload Destination=100");
    });

    it("should upload pasted file from anywhere on the page", () => {
        cy.get("body")
            .pasteFile(fileName);

        cy.wait(200);
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });
});
