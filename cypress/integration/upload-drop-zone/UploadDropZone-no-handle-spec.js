import { ITEM_START } from "../../constants";
import dropFile from "../dropFile";

describe("UploadDropZone - shouldHandleDrag", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadDropZone",
            "with-dnd-turned-off",
            { mockDelay: 100 }
        );
    });

    it("should not do drop when shouldHandleDrag = false", () => {
        dropFile(fileName, () => {
            cy.waitExtraShort();
            cy.storyLog().assertNoLogPattern(ITEM_START);
        });
    });
});
