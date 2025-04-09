describe("UploadDropZone - Simple", () => {
    before(() => {
        cy.visitStory("uploadDropZone", "with-aria-modal-overlay", );
    });

    it("should work with aria modal", () => {
        cy.get("#aria-modal-modal")
            .trigger("dragenter", { dataTransfer: { items: [ { kind: "file" } ] } });

        cy.get(".dropIndicator")
            .should("be.visible");

        cy.get(".dropIndicator")
            .trigger("dragleave");

        cy.get(".dropIndicator")
            .should("not.be.visible");
    });
});
