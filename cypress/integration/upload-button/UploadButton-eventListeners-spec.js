import uploadFile from "../uploadFile";
import { WAIT_X_SHORT } from "../specWaitTimes";

describe("UploadButton - With Event Listeners", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-event-listeners&knob-mock send delay_Upload Destination=100");
    });

    it("should use event listeners", () => {
        uploadFile(fileName, () => {
            cy.wait(WAIT_X_SHORT);

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
