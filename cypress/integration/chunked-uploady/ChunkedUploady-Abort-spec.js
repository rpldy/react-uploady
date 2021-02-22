import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("ChunkedUploady - Abort and continue", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("chunkedUploady", "with-abort-button&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url&knob-chunk size (bytes)_Upload Settings=50000");
    });

    it("should be able to upload again after abort", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.get("button[data-test='abort-batch-0']")
                .click();

            cy.storyLog().assertLogPattern(/BATCH_ABORT/);
            cy.storyLog().assertLogPattern(/ITEM_ABORT/);

            uploadFile(fileName, () => {
                cy.wait(500);

                cy.storyLog().assertFileItemStartFinish(fileName, 5);

                let uniqueHeader;

                cy.wait("@uploadReq")
                    .then((xhr) => {
                        const headers = xhr.request.headers;
                        uniqueHeader = headers["x-unique-upload-id"];

                        expect(uniqueHeader)
                            .to.match(/rpldy-chunked-uploader-/);

                        expect(headers["content-range"])
                            .to.match(/bytes 0-49999\//);
                    });

                cy.wait("@uploadReq")
                    .then((xhr) => {
                        expect(uniqueHeader).to.be.ok;
                        expect(uniqueHeader).to.equal(xhr.request.headers["x-unique-upload-id"]);

                        expect(xhr.request.headers["content-range"])
                            .to.match(/bytes 50000-\d+\//);
                    });
            }, "#upload-button");
        }, "#upload-button");
    });
});
