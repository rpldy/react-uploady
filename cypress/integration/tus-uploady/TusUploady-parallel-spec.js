import uploadFile from "../uploadFile";
import intercept from "../intercept";

describe("TusUploady - Parallel", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "tusUploady",
            "with-tus-concatenation",
            {
                useMock: false,
                uploadUrl: "http://test.tus.com/upload",
                chunkSize: 200000,
                tusResumeStorage: true,
                uploadParams: { foo: "bar" },
            }
        );
    });

    it("should upload chunks using tus protocol in parallel", () => {
        let reqCount = 0;
        const createUrls = ["123", "456", "final"];

        cy.intercept("POST", "http://test.tus.com/upload", (req) => {
            req.reply(200, { success: true }, {
                "Location": `http://test.tus.com/upload/${createUrls[reqCount]}`,
                "Tus-Resumable": "1.0.0",
            });

            reqCount += 1;
        }).as("createReq");

        intercept("http://test.tus.com/upload/123", "PATCH", {
            headers: {
                "Tus-Resumable": "1.0.0",
                "Upload-Offset": "200000"
            },
        }, "patchReq1");

        intercept("http://test.tus.com/upload/456", "PATCH", {
            headers: {
                "Tus-Resumable": "1.0.0",
                "Upload-Offset": "175000"
            },
        }, "patchReq2");

        cy.get("input")
            .should("exist")
            .as("fInput");

        uploadFile(fileName, () => {
            cy.waitMedium();

            cy.storyLog()
                .assertFileItemStartFinish(fileName, 1)
                .then((startFinishEvents) => {
                    cy.wait("@createReq")
                        .then((xhr) => {
                            expect(xhr.request.headers["upload-length"]).to.eq("200000");
                            expect(xhr.request.headers["upload-concat"]).to.eq("partial");
                        });

                    cy.wait("@createReq")
                        .then((xhr) => {
                            expect(xhr.request.headers["upload-length"]).to.eq("172445");
                            expect(xhr.request.headers["upload-concat"]).to.eq("partial");
                        });

                    cy.wait("@patchReq1")
                        .then(({ request }) => {
                            const { headers } = request;
                            expect(headers["content-length"]).to.eq("200000");
                            expect(headers["content-type"]).to.eq("application/offset+octet-stream");
                        });

                    cy.wait("@patchReq2")
                        .then(({ request }) => {
                            const { headers } = request;
                            expect(headers["content-length"]).to.eq("172445");
                            expect(headers["content-type"]).to.eq("application/offset+octet-stream");
                        });

                    cy.wait("@createReq")
                        .then((xhr) => {
                            expect(xhr.request.headers["upload-metadata"])
                                .to.eq("foo YmFy");

                            expect(xhr.request.headers["upload-concat"])
                                .to.eq("final;http://test.tus.com/upload/123 http://test.tus.com/upload/456");

                            expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq("http://test.tus.com/upload/final");
                        });
                });
        });
    });
});
