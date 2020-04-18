describe("UploadButton Tests", () => {

    beforeEach(() => {
        cy.visitStory("uploadButton", "with-progress");
    });

    it("Upload Button - With Progress", () => {
        cy.iframe("#storybook-preview-iframe")
            .then((iframe) => {

                cy.get(iframe.find("button"))
                    .click();

                const rpldyFileInput = iframe.find("input");

                const fileName = "flower.jpg";

                cy.fixture(fileName, "base64").then((fileContent) => {
                    cy.wrap(rpldyFileInput).upload(
                        { fileContent, fileName, mimeType: "image/jpeg" },
                        { subjectType: "input" });

                    cy.wait(2000);

                    cy.storyLog().assertLogPattern(/progress event uploaded: \d+, completed: \d+$/, 5);
                });
            });
    });
});
