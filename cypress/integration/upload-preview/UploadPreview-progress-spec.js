import { interceptWithDelay } from "../intercept";
import uploadFile from "../uploadFile";
import { UPLOAD_URL } from "../../constants";

describe("UploadPreview - Progress", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory(
            "uploadPreview",
            "with-progress",
            { uploadType: "local" }
        );
    });

    it("should show upload preview", () => {
        interceptWithDelay(100, "uploadReq", UPLOAD_URL);

        uploadFile(fileName, () => {
            cy.get(".preview-img")
                .should("have.css", "opacity", "0");

            cy.wait(100);
            cy.get(".preview-img")
                .should("have.css", "opacity", "1");
        });
    });
});
