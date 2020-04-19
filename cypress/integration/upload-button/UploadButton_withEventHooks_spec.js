describe("UploadButton Tests", () => {
    before(() => {
        cy.visitStory("uploadButton", "with-event-hooks");
    });

    it("Upload Button - With Event Hooks", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.get("@iframe")
            .find("button")
            .click();

        const fileName = "flower.jpg";

        cy.fixture(fileName, "base64").then((fileContent) => {
            cy.get("@iframe")
                .find("input")
                .upload(
                    { fileContent, fileName, mimeType: "image/jpeg" },
                    { subjectType: "input" });

            cy.wait(1000);

            cy.get("@iframe")
                .find("ul[data-test='hooks-events']")
                .should("be.visible")
                .as("eventsLog");

            const eventsItems = cy.get("@eventsLog").find("li");

            eventsItems.first()
                .should("contain", "hooks: Batch Start - batch-1 - item count = 1")
                .next()
                .should("contain", `hooks: Item Start - batch-1.item-1 : ${fileName}`)
                .next()
                .should("contain", `hooks: Item Finish - batch-1.item-1 : ${fileName}`)
                .next()
                .should("contain", "hooks: Batch Finish - batch-1 - item count = 1");
        });
    });
});
