import { interceptWithHandler } from "../intercept";
import uploadFile from "../uploadFile";

describe("ChunkedUploady - Custom Success Callback", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "chunkedUploady",
            "simple",
            { useMock: false, chunkSize: 50000 }
        );
    });

    it("should work with custom success code", () => {
        interceptWithHandler((req) => {
            req.reply(308, { success: true });
        });

        cy.setUploadOptions({ isSuccessfulCall: (xhr) => xhr.status === 308 });

        uploadFile(fileName, () => {
            cy.waitShort();

            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
