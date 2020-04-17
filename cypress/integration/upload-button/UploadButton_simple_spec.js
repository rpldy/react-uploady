describe("UploadButton Tests", () => {

    beforeEach(() => {
        cy.visitStory("uploadButton", "simple");
    });

    it("Simple", () => {

        cy.iframe("#storybook-preview-iframe")
            .then(async (iframe) => {

                cy.wrap(iframe.find("button"))
                    .should("be.visible")
                    .click();

                const rpldyFileInput = iframe.find("input");

                const fileName = "flower.jpg";

                cy.fixture(fileName, "base64").then((fileContent) => {
                    cy.wrap(rpldyFileInput).upload(
                        { fileContent, fileName, mimeType: "image/jpeg" },
                        { subjectType: 'input' });
                });
            });
    });
})
