import { interceptWithDelay } from "../intercept";
import { uploadFileTimes } from "../uploadFile";
import { BATCH_ADD, ITEM_START, ITEM_FINISH } from "../../constants";
import { WAIT_SHORT, WAIT_X_SHORT } from "../../constants";
import { examineCroppedUploadReq, examineFullUploadRequest } from "./examineCroppedUploadReq";

describe("UploadPreview - Multi Crop", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadPreview",
            "with-multi-crop",
            { useMock: false }
        );
    });

    beforeEach(() => {
        cy.storyLog().resetStoryLog()
    });

    it("should remove file from thumb", () => {
        interceptWithDelay(100);

        uploadFileTimes(fileName, () => {
            cy.wait(WAIT_X_SHORT);

            cy.get(".remove-preview-batch-1_item-1")
                .click();

            cy.get("img.preview-thumb")
                .should("have.length", 2)
                .eq("0").click();

            cy.get("img.ReactCrop__image")
                .should("have.length", 1);

            cy.get("#save-crop-btn").click();
            cy.get("img.preview-thumb.cropped")
                .should("have.length", 1);

            cy.get("#upload-all-btn").click();

            examineCroppedUploadReq(cy.wait("@uploadReq"), "flower2.jpg");
            examineFullUploadRequest(cy.wait("@uploadReq"), "flower3.jpg");

            cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });

            cy.wait(WAIT_SHORT);

            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
        }, 3, "#upload-btn");
    });

    it("should remove file from preview", () => {
        cy.reload();
        interceptWithDelay(100);

        uploadFileTimes(fileName, () => {
            cy.wait(WAIT_X_SHORT);

            cy.get("img.preview-thumb")
                .should("have.length", 3)
                .eq("0").click();


            cy.get("#remove-selected-btn")
                .click();

            cy.get("img.preview-thumb")
                .should("have.length", 2)
                .eq("0").click();

            cy.get("img.ReactCrop__image")
                .should("have.length", 1);

            cy.get("#save-crop-btn").click();
            cy.get("img.preview-thumb.cropped")
                .should("have.length", 1);

            cy.get("#upload-all-btn").click();

            examineCroppedUploadReq(cy.wait("@uploadReq"), "flower2.jpg");
            examineFullUploadRequest(cy.wait("@uploadReq"), "flower3.jpg");

            cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });

            cy.wait(WAIT_SHORT);

            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
        }, 3, "#upload-btn");

    });
});
