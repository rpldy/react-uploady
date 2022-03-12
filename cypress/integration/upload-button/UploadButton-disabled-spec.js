import uploadFile from "../uploadFile";
import { WAIT_MEDIUM, WAIT_X_SHORT } from "../../constants";

describe("UploadButton - Disabled During Upload", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "disabled-during-upload");
    });

    it("should disable upload button during upload", () => {
        cy.get("input")
            .should("exist")
            .as("fInput");

        uploadFile(fileName, () => {
            cy.wait(WAIT_X_SHORT);
            cy.get("@uploadButton").should("be.disabled");

            cy.wait(WAIT_MEDIUM);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            cy.get("@uploadButton").should("not.be.disabled");
        });
    });
});
