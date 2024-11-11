import uploadFile from "../uploadFile";
import intercept from "../intercept";

describe("TusUploady - Send Data", () => {
    const fileName = "flower.jpg";

    const loadStory = (chunkSize) => {
        cy.visitStory(
            "tusUploady",
            "simple",
            {
                uploadUrl: "http://test.tus.com/upload",
                chunkSize: chunkSize,
                uploadParams: { foo: "bar" },
                tusResumeStorage: true,
                tusIgnoreModifiedDateInStorage: true,
                tusSendOnCreate: true,
            }
        );
    };

    const runTest = (chunkSize, isFileSmallerThanChunk = false) => {
        loadStory(chunkSize);

        intercept("http://test.tus.com/upload", "POST", {
            headers: {
                "Location": "http://test.tus.com/upload/123",
                "Tus-Resumable": "1.0.0",
                "Upload-Offset": `${chunkSize}`,
            }
        }, "createReq");

        intercept("http://test.tus.com/upload/123", "PATCH", {
            headers: {
                "Tus-Resumable": "1.0.0",
            },
        }, "patchReq");

        cy.get("input")
            .should("exist")
            .as("fInput");

        uploadFile(fileName, () => {
            cy.waitMedium();

            cy.storyLog()
                .assertFileItemStartFinish(fileName, 1)
                .then((startFinishEvents) => {

                    cy.wait("@createReq")
                        .then(({ request }) => {
                            const expectedLength = request.body.byteLength < chunkSize ? request.body.byteLength : chunkSize;
                            expect(request.headers["content-length"]).to.eq(`${expectedLength}`);

                            expect(request.headers["upload-metadata"])
                                .to.eq("foo YmFy");

                            expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq("http://test.tus.com/upload/123");
                        });

                    if (!isFileSmallerThanChunk) {
                        cy.wait("@patchReq")
                            .then(({ request }) => {
                                const { headers } = request;
                                expect(headers["upload-offset"]).to.eq(`${chunkSize}`);
                                expect(headers["content-type"]).to.eq("application/offset+octet-stream");
                            });
                    }
                });
        }, "#upload-button");
    };

    it("should upload chunks using tus protocol with data on create - chunk size smaller than files", () => {
        const chunkSize = 200000;
        runTest(chunkSize);
    });

    it("should upload chunks using tus protocol with data on create - file smaller than chunk size", () => {
        const chunkSize = 2000000;
        runTest(chunkSize, true);
    });

});
