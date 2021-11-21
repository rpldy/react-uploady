import uploadFile from "../uploadFile";
import { WAIT_LONG } from "../specWaitTimes";

describe("UploadButton - With Component asButton", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-component-as-button");
    });

    it("should make any custom component an upload button", () => {
        uploadFile(fileName, () => {
            cy.wait(WAIT_LONG);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        }, "#div-upload");
    });
});
