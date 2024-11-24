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
                chunkSize: 200_000,
                tusResumeStorage: true,
                uploadParams: { foo: "bar" },
            }
        );
    });

    it.only("should upload chunks using tus protocol in parallel", () => {
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

            let fileLength = 0;
            cy.get(`@${fileName}`)
                .then((uploadFile) => {
                    cy.log(`GOT UPLOADED FILE Length ===> ${uploadFile.length}`);
                    fileLength = uploadFile.length;
                });

            cy.storyLog()
                .assertFileItemStartFinish(fileName, 1)
                .then((startFinishEvents) => {
                    const createSize = Math.floor(fileLength / 2);
                    cy.wait("@createReq")
                        .then((xhr) => {
                            expect(xhr.request.headers["upload-length"]).to.eq(`${Math.floor(fileLength / 2)}`);
                            expect(xhr.request.headers["upload-concat"]).to.eq("partial");
                        });

                    cy.wait("@createReq")
                        .then((xhr) => {
                            expect(xhr.request.headers["upload-length"]).to.eq(`${Math.floor(fileLength / 2)}`);
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

    it("should reuse the same upload url for parallel chunks from previously finished chunk", () => {
        let reqCount = 0;
        const parallelCount = 3;
        const createUrls = ["123", "456", "789", "final"];

        const createPatchIntercept = (urlPath) => {
            let accumOffset = 0;

            cy.intercept("PATCH", `http://test.tus.com/upload/${urlPath}`, (req) => {
                console.log("HANDLING REQUEST FOR PATCH CHUNK", { urlPath, accumOffset, upOffsetHeader: req.headers["upload-offset"] });
                accumOffset+= parseInt(req.headers["upload-offset"]);

                //replying with 204-no content to simulate successful patch request
                req.reply(204, "", {
                    "Tus-Resumable": "1.0.0",
                    "Upload-Offset":`${accumOffset}`,
                });
            }).as(`patchReq_${urlPath}`);
        };

        cy.setUploadOptions({ chunkSize: 20_000, parallel: parallelCount });

        cy.intercept("POST", "http://test.tus.com/upload", (req) => {
            console.log(`createReq is being called for the ${reqCount} time !!!!!!!`);

            expect(reqCount).to.be.lessThan(parallelCount, "createReq should only be called twice (two urls for each parallel chunk)");

            req.reply(200, { success: true }, {
                "Location": `http://test.tus.com/upload/${createUrls[reqCount]}`,
                "Tus-Resumable": "1.0.0",
            });

            reqCount += 1;
        }).as("createReq");

        createPatchIntercept(createUrls[0]);
        createPatchIntercept(createUrls[1]);

        uploadFile(fileName, () => {
            cy.waitMedium();

            cy.storyLog()
                .assertFileItemStartFinish(fileName, 1)
                .then((startFinishEvents) => {


                });
        });
    });
});
