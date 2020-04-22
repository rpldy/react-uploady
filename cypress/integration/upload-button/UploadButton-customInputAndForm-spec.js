describe("With Custom File Input And Form", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-custom-file-input-and-form");
    });

    it("should use form attributes ", () => {
        cy.server();

        cy.route({
            method: "POST",
            url: "http://react-uploady-dummy-server.comm",
            response: { success: true }
        }).as("uploadReq");

        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.get("@iframe")
            .find("button")
            .should("be.visible")
            .click();

        cy.fixture(fileName, "base64").then((fileContent) => {
            cy.get("@iframe")
                .find("input").upload(
                { fileContent, fileName, mimeType: "image/jpeg" },
                { subjectType: "input" });

            cy.wait('@uploadReq').then((xhr) => {
                assert.isNotNull(xhr.response.body);
            });
        });
    });
});
