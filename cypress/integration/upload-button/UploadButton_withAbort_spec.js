describe("UploadButton Tests", () => {


    beforeEach(() => {
        cy.visitStory("uploadButton", "with-abort");
    });

    it("Upload Button - With Abort", () => {
        cy.iframe("#storybook-preview-iframe")
            .then((iframe) => {

                cy.get(iframe.find("#upload-button"))
                    .click();

                const rpldyFileInput = iframe.find("input");

                const abortSelector = "button[data-test='story-abort-button']";

                cy.get(iframe.find(abortSelector))
                    .should("not.exist");

                const fileName = "flower.jpg";

                cy.fixture(fileName, "base64").then(async (fileContent) => {
                    cy.wrap(rpldyFileInput).upload(
                        { fileContent, fileName, mimeType: "image/jpeg" },
                        { subjectType: "input" });

                    cy.wait(500).then(() => {
                        cy.get(iframe.find(abortSelector))
                            .should("be.visible")
                            .click();
                    });

                    cy.storyLog().assertLogPattern(/BATCH_ABORT/, 1);
                    cy.storyLog().assertLogPattern(/ITEM_FINISH/, 0);
                });
            });
    });
});
