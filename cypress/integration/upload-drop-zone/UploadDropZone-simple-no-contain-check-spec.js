describe("UploadDropZone - No Contain Check", () => {
    before(() => {
        cy.visitStory("uploadDropZone", "with-aria-modal-overlay");
    });

    it("should work with aria modal", () => {
        cy.get("#aria-modal-modal")
            .trigger("dragenter", { dataTransfer: { items: [{ kind: "file" }] } });

        // Force visibility check since the element is actually visible but covered
        cy.get(".dropIndicator")
            .should("exist")
            .and("have.css", "display", "block");

        cy.get("#aria-modal-modal")
            .trigger("dragleave");

        cy.get(".dropIndicator")
            .should("have.css", "display", "none");
    });
});
