import { interceptWithDelay } from "../intercept";
import { uploadFileTimes } from "../uploadFile";
import { BATCH_ADD, ITEM_START, ITEM_FINISH } from "../../constants";
import { WAIT_SHORT, WAIT_X_SHORT } from "../../constants";
import { examineCroppedUploadReq, examineFullUploadRequest } from "./examineCroppedUploadReq";

describe("UploadPreview - Multi Crop", () => {
    const fileName = "flower.jpg";

    const loadPage = () => {
        cy.visitStory(
            "uploadPreview",
            "with-multi-crop",
            { useMock: false }
        );

        //have to use autoupload false since react18 - in cypress, upload doesnt cause preSend HOC's effect to run on time - need another click
        cy.setUploadOptions({ autoUpload: false });
    };

    it("should remove file from thumb", () => {
        loadPage();
        interceptWithDelay(100);

        uploadFileTimes(fileName, () => {
            cy.waitExtraShort();
            cy.get("#resume").click();

            cy.get(".remove-preview-batch-1_item-1")
                .click();

            cy.get("img.preview-thumb")
                .should("have.length", 2)
                .eq("0").click();

            cy.get("img.react-crop-img")
                .should("have.length", 1);

            cy.get("#save-crop-btn").click();
            cy.get("img.preview-thumb.cropped")
                .should("have.length", 1);

            cy.get("#upload-all-btn").click();

            examineCroppedUploadReq(cy.wait("@uploadReq"), "flower2.jpg");
            examineFullUploadRequest(cy.wait("@uploadReq"), "flower3.jpg");

            cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });

            cy.waitShort();

            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
        }, 3, "#upload-btn");
    });

    it("should remove file from preview", () => {
        loadPage();
        interceptWithDelay(100);

        uploadFileTimes(fileName, () => {
            cy.waitExtraShort();
            cy.get("#resume").click();

            cy.get("img.preview-thumb")
                .should("have.length", 3)
                .eq("0").click();


            cy.get("#remove-selected-btn")
                .click();

            cy.get("img.preview-thumb")
                .should("have.length", 2)
                .eq("0").click();

            cy.get("img.react-crop-img")
                .should("have.length", 1);

            cy.get("#save-crop-btn").click();
            cy.get("img.preview-thumb.cropped")
                .should("have.length", 1);

            cy.get("#upload-all-btn").click();

            examineCroppedUploadReq(cy.wait("@uploadReq"), "flower2.jpg");
            examineFullUploadRequest(cy.wait("@uploadReq"), "flower3.jpg");

            cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });

            cy.waitShort();

            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
        }, 3, "#upload-btn");

    });
});
