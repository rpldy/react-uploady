import uploadFile from "../uploadFile";

describe("With Event Hooks", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-event-hooks");
    });

    it("should use event hooks", () => {
        uploadFile(fileName, () => {
            cy.wait(1000);

            cy.get("ul[data-test='hooks-events']")
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
