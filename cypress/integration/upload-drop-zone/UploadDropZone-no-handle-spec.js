import { ITEM_START, WAIT_X_SHORT } from "../../constants";
import dropFile from "../dropFile";

describe("UploadDropZone - shouldHandleDrag", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadDropZone", "with-dnd-turned-off&knob-mock send delay_Upload Destination=100");
    });

    it("should not do drop when shouldHandleDrag = false", () => {
        dropFile(fileName, () => {
            cy.wait(WAIT_X_SHORT);
            cy.storyLog().assertNoLogPattern(ITEM_START);
        });
    });
});
