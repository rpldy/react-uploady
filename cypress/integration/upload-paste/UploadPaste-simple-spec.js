describe("UploadPaste - Simple", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory("uploadPaste", "simple", { mockDelay: 100 });
    });

    it("should upload pasted file", () => {
        cy.get("#paste-area")
            .should("exist")
            .pasteFile(fileName);

         cy.waitMedium();
         cy.storyLog().assertFileItemStartFinish(fileName, 1);
    });

    it("should upload pasted files", () => {
        cy.get("#paste-area")
            .should("exist")
            .pasteFile(fileName, 2);

        cy.waitLong();
        cy.storyLog().assertFileItemStartFinish(fileName, 1);
        cy.storyLog().assertFileItemStartFinish("flower2.jpg", 3);
    });
});
