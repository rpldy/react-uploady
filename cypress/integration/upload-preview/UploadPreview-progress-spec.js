import { interceptWithDelay } from "../intercept";
import uploadFile from "../uploadFile";

describe("UploadPreview - Progress", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadPreview", "with-progress&knob-destination_Upload Destination=local");
    });

    it("should show upload preview", () => {
        interceptWithDelay(100, "uploadReq", "http://localhost:4000/upload");
        uploadFile(fileName, () => {

            cy.get(".preview-img")
                .should("have.css", "opacity", "0");

            cy.wait(100);
            cy.get(".preview-img")
                .should("have.css", "opacity", "1");
        });
    });
});
