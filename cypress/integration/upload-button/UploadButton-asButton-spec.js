describe("With Component asButton", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-component-as-button");
    });

    it("should make any custom component an upload button", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.get("@iframe")
            .find("#div-upload")
            .should("be.visible")
            .click();

        cy.fixture(fileName, "base64").then((fileContent) => {
            cy.get("@iframe")
                .find("input").upload(
                { fileContent, fileName, mimeType: "image/jpeg" },
                { subjectType: "input" });

            cy.wait(2000);
            cy.storyLog().assertItemStartFinish(fileName, 1);
        });
    });
});
