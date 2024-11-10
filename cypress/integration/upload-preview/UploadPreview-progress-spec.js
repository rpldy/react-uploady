import { interceptWithDelay } from "../intercept";
import uploadFile from "../uploadFile";

describe("UploadPreview - Progress", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory(
            "uploadPreview",
            "with-progress",
            { useMock: false }
        );
    });

    it("should show upload preview", () => {
        interceptWithDelay(100, "uploadReq");

        uploadFile(fileName, () => {
            cy.get(".preview-img")
                .should("have.css", "opacity", "0");

            cy.wait(100);
            cy.get(".preview-img")
                .should("have.css", "opacity", "1");
        });
    });
});
