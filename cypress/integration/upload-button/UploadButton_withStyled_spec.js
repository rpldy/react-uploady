describe("UploadButton Tests", () => {

    beforeEach(() => {
        cy.visitStory("uploadButton", "with-styled-component");
    });

    it("Upload Button - With Styled Component", () => {
        cy.iframe("#storybook-preview-iframe")
            .then((iframe) => {

                cy.wrap(iframe.find("button"))
                    .should("be.visible")
                    .should("have.css", "background-color", "rgb(1, 9, 22)")
                    .should("have.css", "color", "rgb(176, 177, 179)")
                    .click();

                const rpldyFileInput = iframe.find("input");

                const fileName = "flower.jpg";

                cy.fixture(fileName, "base64").then((fileContent) => {
                    cy.wrap(rpldyFileInput).upload(
                        { fileContent, fileName, mimeType: "image/jpeg" },
                        { subjectType: "input" });

                    cy.wait(3000);
                    cy.storyLog().assertItemStartFinish(fileName);
                });
            });
    });
});
