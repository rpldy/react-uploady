import { uploadFileTimes } from "../uploadFile";
import { WAIT_MEDIUM } from "../../constants";

describe("UploadButton - Simple - Multiple files", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "simple&knob-mock send delay_Upload Destination=100");
    });

    it("should use uploady to upload multiple files", () => {
        cy.get("input")
            .should("exist")
            .as("fInput");

        uploadFileTimes(fileName, () => {
            cy.wait(WAIT_MEDIUM);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            // cy.wait(1500);
            cy.storyLog().assertFileItemStartFinish("flower2.jpg", 3);
            // cy.wait(1500);
            cy.storyLog().assertFileItemStartFinish("flower3.jpg", 5);
        }, 3);
    });
});
