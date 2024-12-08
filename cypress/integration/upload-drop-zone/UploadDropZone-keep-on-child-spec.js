describe("UploadDropZone - Keep Drag on Child", () => {
    it("should not remove drag style on child element", () => {
        cy.visitStory("uploadDropZone", "with-child-element");

        cy.get("#upload-drop-zone")
            .trigger("dragenter", { dataTransfer: { items: [ { kind: "file" } ] } });

        cy.get(".drag-over #dnd-child")
            .should("be.visible");

        cy.get("#upload-drop-zone")
            .trigger("dragleave");

        cy.get(".drag-over #dnd-child")
            .should("not.exist");

        cy.get("#upload-drop-zone")
            .trigger("dragenter", { dataTransfer: { items: [ { kind: "file" } ] } });

        cy.get(".drag-over #dnd-child")
            .should("be.visible");

        cy.get("#upload-drop-zone")
            .trigger("dragleave");

        cy.get("#dnd-child")
            .trigger("dragenter", { dataTransfer: { items: [ { kind: "file" } ] } });

        cy.get(".drag-over #dnd-child")
            .should("be.visible");
    });
});
