import { interceptWithDelay } from "../intercept";
import { uploadFileTimes } from "../uploadFile";
import { BATCH_ADD, ITEM_START } from "../storyLogPatterns";
import { WAIT_X_SHORT } from "../specWaitTimes";

describe("UploadPreview - Multi Crop", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview", "with-multi-crop&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url");
    });

    beforeEach(() => {
        cy.storyLog().resetStoryLog()
    });

    const examineUploadReq = (req, name) =>
        req.interceptFormData((formData) => {
            expect(formData["file"]).to.eq(name);
        })
            .its("request.headers")
            .its("content-length")
            .then((length) => {
                expect(parseInt(length)).to.be.lessThan(1500);
            });

    it("should show upload crop for each item before upload", () => {
        interceptWithDelay(100);

        uploadFileTimes(fileName, () => {
            cy.wait(WAIT_X_SHORT);

            cy.storyLog().assertLogPattern(BATCH_ADD);
            cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });

            cy.get("img.ReactCrop__image")
                .should("have.length", 2);

            cy.get(".preview-crop-btn").eq(0).click();
            cy.get(".preview-crop-btn").eq(1).click();

            examineUploadReq(cy.wait("@uploadReq"), "flower.jpg");
            examineUploadReq(cy.wait("@uploadReq"), "flower2.jpg");

            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            cy.storyLog().assertFileItemStartFinish("flower2.jpg", 2);

            cy.get("img.ReactCrop__image")
                .should("have.length", 3);

            cy.get(".preview-crop-btn").eq(2).click();

            examineUploadReq(cy.wait("@uploadReq"), "flower3.jpg");
            cy.storyLog().assertFileItemStartFinish("flower3.jpg", 4);
        }, 3, "#upload-btn");
    });
});
