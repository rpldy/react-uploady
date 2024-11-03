import { interceptWithHandler } from "../intercept";
import { interceptFormData } from "cypress-intercept-formdata";
import { ITEM_ABORT, BATCH_ABORT } from "../../constants";
import uploadFile from "../uploadFile";

describe("ChunkedUploady - Abort and continue", () => {
    const fileName = "flower.jpg",
        abortedFileName = "aborted.jpg";

    before(() => {
        cy.visitStory(
            "chunkedUploady",
            "with-abort-button",
            { useMock: false, chunkSize: 50000 }
        );
    });

    it("should be able to upload again after abort", () => {
        let abortedRequests = 0;

        interceptWithHandler((req) => {
            const formData = interceptFormData(req);

            if (formData["file"] === abortedFileName) {
                abortedRequests += 1;
            }

            req.reply(200, { success: true });
        }, "canceledReq");

        uploadFile(fileName, () => {
            cy.get("button[data-test='abort-batch-0']")
                .click();

            cy.waitMedium();

            cy.storyLog().assertLogPattern(BATCH_ABORT);
            cy.storyLog().assertLogPattern(ITEM_ABORT);

            interceptWithHandler((req) => {
                req.reply(200, { success: true });
            }, "uploadReq");

            uploadFile(fileName, () => {
                cy.waitExtraLong();

                let uniqueHeader;

                cy.wait("@uploadReq")
                    .then(({ request }) => {
                        const headers = request.headers;
                        uniqueHeader = headers["x-unique-upload-id"];

                        expect(uniqueHeader)
                            .to.match(/rpldy-chunked-uploader-/);

                        expect(headers["content-range"])
                            .to.match(/bytes 0-49999\//, `aborted upload made: ${abortedRequests} requests`);
                    });

                cy.wait("@uploadReq")
                    .then((xhr) => {
                        expect(uniqueHeader).to.be.ok;
                        expect(xhr.request.headers["x-unique-upload-id"]).to.equal(uniqueHeader);

                        expect(xhr.request.headers["content-range"])
                            .to.match(/bytes 50000-\d+\//);

                        cy.storyLog().assertFileItemStartFinish(fileName, 6);
                    });
            }, "#upload-button");
        }, "#upload-button", { fileName: abortedFileName });
    });
});
