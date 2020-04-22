describe("UploadButton - Simple", () => {
    const fileName = "flower.jpg";
    
    before(() => {
        cy.visitStory("uploadButton", "simple");
    });

    it("should use uploady", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.get("@iframe")
            .find("button")
            .should("be.visible")
            .click()
            .as("uploadButton");

        cy.get("@iframe")
            .find("input")
            .should("exist")
            .as("fInput");

        cy.fixture(fileName, "base64").then((fileContent) => {
            cy.get("@fInput").upload(
                { fileContent, fileName, mimeType: "image/jpeg" },
                { subjectType: "input" });

            cy.wait(2000);
            cy.storyLog().assertItemStartFinish(fileName, 1);
        });
    });
});
