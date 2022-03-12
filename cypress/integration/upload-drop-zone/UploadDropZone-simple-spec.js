import dropFile from "../dropFile";
import { WAIT_X_SHORT } from "../../constants";

describe("UploadDropZone - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadDropZone", "simple&knob-mock send delay_Upload Destination=100");
    });

    it("should upload dropped file", () => {
        dropFile(fileName, () => {
            cy.wait(WAIT_X_SHORT);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
