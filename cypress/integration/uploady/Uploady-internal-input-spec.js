describe("Uploady - Internal Input", () => {
    before(() => {
        cy.visitStory("uploady", "with-exposed-internal-input");
    });

    it("should use internal file input from useFileInput", () => {
        cy.get("#select-input-type")
            .select("dir");

        cy.get("input[type='file']")
            .should("have.attr", "webkitdirectory", "true");
    });
});
