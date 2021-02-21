import uploadFile from "../uploadFile";

describe("With Event Listeners", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-event-listeners");
    });

    it("should use event listeners", () => {
        uploadFile(fileName, () => {
            cy.wait(1000);

            cy.get("ul[data-test='hooks-events']")
                .should("be.visible")
                .as("eventsLog");

            const eventsItems = cy.get("@eventsLog").find("li");

            eventsItems.first()
                .should("contain", "Batch Start - batch-1 - item count = 1")
                .next()
                .should("contain", `Item Start - batch-1.item-1 : ${fileName}`)
                .next()
                .should("contain", `Item Finish - batch-1.item-1 : ${fileName}`)
                .next()
                .should("contain", "Batch Finish - batch-1 - item count = 1");
        });
    });
});
