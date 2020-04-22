describe("With Styled Component", () => {
    const fileName = "flower.jpg";
    
    before(() => {
        cy.visitStory("uploadButton", "with-styled-component");
    });

    it("should be styled with styled-components", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.get("@iframe")
            .find("button")
            .should("be.visible")
            .should("have.css", "background-color", "rgb(1, 9, 22)")
            .should("have.css", "color", "rgb(176, 177, 179)")
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
