import { uploadFileTimes } from "../uploadFile";
import { WAIT_MEDIUM, WAIT_X_SHORT } from "../specWaitTimes";
import { ITEM_START } from "../storyLogPatterns";

describe("UploadPreview - Custom Batch Items Method", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview", "with-different-batch-items-method&knob-mock send delay_Upload Destination=100");
    });

    it("should show upload previews for pending batch", () => {
        uploadFileTimes(fileName, () => {
            cy.wait(WAIT_X_SHORT);

            cy.get("img[data-test='upload-preview']")
                .should("have.length", 3);

            cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

            cy.get("#upload-pending-btn").click();

            cy.wait(WAIT_MEDIUM);

            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            cy.storyLog().assertFileItemStartFinish("flower2.jpg", 3);
            cy.storyLog().assertFileItemStartFinish("flower3.jpg", 5);
        }, 3, "#upload-btn");
    });
});
