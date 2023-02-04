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

    it("should allow cropping for all items in a batch" , () => {
        interceptWithDelay(100);

        uploadFileTimes(fileName, () => {
            cy.wait(WAIT_X_SHORT);

            cy.storyLog().assertLogPattern(BATCH_ADD);
            cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

            cy.get("#upload-btn")
                .should("have.length", 0);

            cy.get("img.preview-thumb")
                .should("have.length", 3)
                .eq("0").click();

            cy.get("img.ReactCrop__image")
                .should("have.length", 1);

            cy.get("#save-crop-btn").click();
            cy.get("img.preview-thumb.cropped")
                .should("have.length", 1);

            cy.get("img.preview-thumb").eq(1).click();
            cy.get("#save-crop-btn").click();
            cy.get("img.preview-thumb.cropped")
                .should("have.length", 2);

            cy.get("#upload-all-btn").click();

            examineCroppedUploadReq(cy.wait("@uploadReq"), "flower.jpg");
            examineCroppedUploadReq(cy.wait("@uploadReq"), "flower2.jpg");
            examineFullUploadRequest(cy.wait("@uploadReq"), "flower3.jpg");

            cy.storyLog().assertLogPattern(ITEM_START, { times: 3 });

            cy.wait(WAIT_SHORT);

            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 3 });
        }, 3, "#upload-btn");
    });

    it("should perform crop for items in consecutive batches", () => {
        cy.reload();
        interceptWithDelay(100);

        uploadFileTimes(fileName, () => {
            cy.wait(WAIT_X_SHORT);

            cy.get("img.preview-thumb").eq(1).click();
            cy.get("#save-crop-btn").click();
            cy.wait(WAIT_SHORT);
            cy.get("#upload-all-btn").click();

            examineFullUploadRequest(cy.wait("@uploadReq"), "flower.jpg");
            examineCroppedUploadReq(cy.wait("@uploadReq"), "flower2.jpg");

            cy.get("img.preview-thumb.finished")
                .should("have.length", 2);

            uploadFileTimes(fileName, () => {
                cy.wait(WAIT_X_SHORT);
                cy.get("img.preview-thumb").eq(2).click();
                cy.get("#save-crop-btn").click();
                cy.wait(WAIT_SHORT);
                cy.get("img.preview-thumb.cropped")
                    .eq(0).should("exist");
                cy.get("#upload-all-btn").click();

                examineCroppedUploadReq(cy.wait("@uploadReq"), "flower.jpg");
                examineFullUploadRequest(cy.wait("@uploadReq"), "flower2.jpg");

                cy.wait(WAIT_SHORT);

                cy.storyLog().assertLogPattern(ITEM_START, { times: 4 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 4 });
            }, 2, "#upload-btn");
        }, 2, "#upload-btn");
    });
});
