describe("UploadDropZone - Custom Remove", () => {
    before(() => {
        cy.visitStory("uploadDropZone", "with-full-screen");
    });

    it("should remove the drag overlay", () => {
        cy.get("#upload-drop-zone")
            .trigger("dragenter", { dataTransfer: { items: [ { kind: "file" } ]} });

        cy.get(".dropIndicator")
            .should("be.visible");

        cy.get(".dropIndicator")
            .trigger("dragleave");

        cy.get(".dropIndicator")
            .should("not.be.visible");
    });
});
