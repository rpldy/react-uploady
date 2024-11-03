describe("UploadPaste - Window Listener", () => {
    const fileName = "flower.jpg";

    const loadPage = () =>
        cy.visitStory(
            "uploadPaste",
            "with-window-paste",
            { mockDelay: 100 }
        );

    it("should upload pasted file from anywhere on the page", () => {
        loadPage();
        //wait for body to render first
        cy.get("#storybook-root button")

        cy.get("body")
            .pasteFile(fileName);

        cy.waitExtraShort();
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });
});
