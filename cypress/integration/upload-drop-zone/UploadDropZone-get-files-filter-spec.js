import { ITEM_FINISH, ITEM_START } from "../../constants";
import { dropFiles } from "../dropFile";

describe("UploadDropZone - getFiles filter", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadDropZone",
            "with-drop-handler-and-get-files",
            { mockDelay: 100, customArgs: { maxDropCount: 1 } }
        );
    });

    it("should filter to one file only", () => {
        dropFiles(fileName, 2, () => {
            cy.waitShort();
            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
        });
    });

    it("should filter to 0 files", () => {
        cy.visitStory(
            "uploadDropZone",
            "with-drop-handler-and-get-files",
            { mockDelay: 100, customArgs: { maxDropCount: 0 } }
        );

        dropFiles(fileName, 2, () => {
            cy.waitShort();
            cy.storyLog().assertNoLogPattern(ITEM_START);
        });
    });
});
