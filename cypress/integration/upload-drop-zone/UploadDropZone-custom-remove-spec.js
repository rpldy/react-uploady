describe("UploadDropZone - Different Config", () => {
    before(() => {
        cy.visitStory("uploadDropZone", "with-full-screen");
    });

    it("should remove the drag overlay", () => {
        cy.get("#upload-drop-zone")
            .trigger("dragenter");

        cy.get(".dropIndicator")
            .should("be.visible");

        cy.get(".dropIndicator")
            .trigger("dragleave");

        cy.get(".dropIndicator")
            .should("not.be.visible");
    });
});
