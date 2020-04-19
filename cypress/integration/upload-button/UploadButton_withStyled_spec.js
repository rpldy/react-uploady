describe("UploadButton Tests", () => {
    before(() => {
        cy.visitStory("uploadButton", "with-styled-component");
    });

    it("Upload Button - With Styled Component", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.get("@iframe")
            .find("button")
            .should("be.visible")
            .should("have.css", "background-color", "rgb(1, 9, 22)")
            .should("have.css", "color", "rgb(176, 177, 179)")
            .click();

        const fileName = "flower.jpg";

        cy.fixture(fileName, "base64").then((fileContent) => {
            cy.get("@iframe")
                .find("input").upload(
                { fileContent, fileName, mimeType: "image/jpeg" },
                { subjectType: "input" });

            cy.wait(2000);
            cy.storyLog().assertItemStartFinish(fileName);
        });
    });
});
