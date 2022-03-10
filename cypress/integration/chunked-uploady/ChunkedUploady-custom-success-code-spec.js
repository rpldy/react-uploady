import { interceptWithHandler } from "../intercept";
import uploadFile from "../uploadFile";
import { WAIT_SHORT } from "../specWaitTimes";


describe("ChunkedUploady - Custom Success Code", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "chunkedUploady",
            "simple&knob-chunk size (bytes)_Upload Settings=50000",
            { useMock: false }
        );
    });

    it("should work with custom success code", () => {
        interceptWithHandler((req) => {
            req.reply(308, { success: true });
        });

        cy.setUploadOptions({ isSuccessfulCall: (xhr) => xhr.status === 308 });

        uploadFile(fileName, () => {
            cy.wait(WAIT_SHORT);

            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
