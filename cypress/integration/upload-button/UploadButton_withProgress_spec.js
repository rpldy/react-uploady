describe("UploadButton Tests", () => {
    before(() => {
        cy.visitStory("uploadButton", "with-progress");
    });

    it("Upload Button - With Progress", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.get("@iframe")
            .find("button")
            .click()

        const fileName = "flower.jpg";

        cy.fixture(fileName, "base64").then((fileContent) => {
            cy.get("@iframe")
                .find("input").upload(
                { fileContent, fileName, mimeType: "image/jpeg" },
                { subjectType: "input" });

            cy.wait(2000);

            cy.storyLog().assertLogPattern(/progress event uploaded: \d+, completed: \d+$/, {times: 5, different: true});
        });
    });
});
