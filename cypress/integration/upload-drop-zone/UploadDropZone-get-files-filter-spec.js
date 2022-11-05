import { ITEM_FINISH, ITEM_START, WAIT_SHORT } from "../../constants";
import { dropFiles } from "../dropFile";

describe("UploadDropZone - getFiles filter", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadDropZone", "with-drop-handler-and-get-files&knob-mock send delay_Upload Destination=100&knob-file count in drop_Upload Settings=1");
    });

    it("should filter to one file only", () => {
        dropFiles(fileName, 2, () => {
            cy.wait(WAIT_SHORT);
            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
        });
    });

    it("should filter to 0 files", () => {
        cy.visitStory("uploadDropZone", "with-drop-handler-and-get-files&knob-mock send delay_Upload Destination=100&knob-file count in drop_Upload Settings=0");

        dropFiles(fileName, 2, () => {
            cy.wait(WAIT_SHORT);
            cy.storyLog().assertNoLogPattern(ITEM_START);
        });
    });
});
