import uploadFile from "../uploadFile";
import { createTusIntercepts, parallelFinalUrl, uploadUrl } from "./tusIntercept";
import clearTusPersistStorage from "./clearTusPersistStorage";

describe("TusUploady - Parallel", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory(
            "tusUploady",
            "with-tus-concatenation",
            {
                useMock: false,
                uploadUrl,
                chunkSize: 200_000,
                tusResumeStorage: true,
                uploadParams: { foo: "bar" },
            }
        );

        clearTusPersistStorage();
    });

    const runParallelUpload = (parallel, testCb) => {
        let runCount = 0;

        const run = (cb) => {
            let partSize = 0, fileSize = 0;

            cy.get("input")
                .should("exist")
                .as("fInput");

            uploadFile(fileName, () => {
                cy.waitMedium();

                cy.get(`@${fileName}`)
                    .then((uploadFile) => {
                        fileSize = uploadFile.length;
                        cy.log(`GOT UPLOADED FILE Length ===> ${fileSize}`);
                        partSize = Math.floor(fileSize / parallel);
                    });

                cy.storyLog()
                    .assertFileItemStartFinish(fileName, 1 + (runCount * 4))
                    .then((startFinishEvents) => {
                        cb(fileSize, partSize, startFinishEvents);
                    });
            });

            return (nextCb) => {
                runCount += 1;
                run(nextCb);
            };
        }

        return run(testCb);
    };

    it("should upload chunks using tus protocol in parallel, chunk size larger than part size", () => {
        const parallel = 2;
        const {
            assertCreateRequest,
            assertPatchRequest,
            assertPatchRequestTimes,
            assertParallelFinalRequest,
        } = createTusIntercepts({ parallel });

        runParallelUpload(parallel, (fileSize, createSize, startFinishEvents) => {
            assertCreateRequest(createSize + 1);
            assertCreateRequest(createSize);

            assertPatchRequest(createSize + 1, 0);
            assertPatchRequest(createSize, 1);

            assertPatchRequestTimes(0, 1);
            assertPatchRequestTimes(1, 1);

            assertParallelFinalRequest(({ request }) => {
                expect(request.headers["upload-metadata"])
                    .to.eq("foo YmFy");
                expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(parallelFinalUrl);
            });
        });
    });

    it("should upload chunks using tus protocol in parallel, chunk size smaller than part size", () => {
        const chunkSize = 50_000;
        const parallel = 3;

        const {
            assertCreateRequest,
            assertPatchRequest,
            assertPatchRequestTimes,
            assertParallelFinalRequest
        } = createTusIntercepts({ parallel });

        cy.setUploadOptions({ chunkSize, parallel });

        runParallelUpload(parallel, (fileSize, createSize, startFinishEvents) => {
            assertCreateRequest(createSize + 1);
            assertCreateRequest(createSize + 1);
            assertCreateRequest(createSize - 1);

            assertPatchRequest(chunkSize, 0);
            assertPatchRequest(chunkSize, 1);
            assertPatchRequest(chunkSize, 2);

            assertPatchRequestTimes(0, 3);
            assertPatchRequestTimes(1, 3);
            assertPatchRequestTimes(2, 3);

            assertParallelFinalRequest(({ request }) => {
                expect(request.headers["upload-metadata"])
                    .to.eq("foo YmFy");
                expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(parallelFinalUrl);
            });
        });
    });

    it("should upload chunks using tus protocol in parallel, with resume on the whole file", () => {
        const parallel = 2;

        const {
            getPartUrls,
            addResumeForFinal,
            assertPatchRequestTimes,
            assertCreateRequestTimes,
            assertLastCreateRequest,
            assertResumeRequest,
        } = createTusIntercepts({ parallel });

        const runAgain = runParallelUpload(parallel, (fileSize, createSize, startFinishEvents) => {
            assertLastCreateRequest(({ request }) => {
                expect(request.headers["upload-concat"])
                    .to.eq(`final;${getPartUrls().join(" ")}`);
                expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(parallelFinalUrl);
            });

            addResumeForFinal(fileSize);

            runAgain((fileSize, createSize, startFinishEvents) => {
                expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(parallelFinalUrl);

                assertPatchRequestTimes(0, 1, "should only have patch req for the first upload, not for resume");
                assertPatchRequestTimes(1, 1, "should only have patch req for the first upload, not for resume");
                assertCreateRequestTimes(3, "should only have 3 requests (create, final, resume)");

                assertResumeRequest(({ request }) => {
                    console.log(" RESUME REQUEST ", request);
                    expect(request.method).to.eq("HEAD");
                });
            });
        });
    });

    it("should upload chunks using tus protocol in parallel, with resume on one of the parts", () => {
        const parallel = 2;

        const {
            getPartUrls,
            addResumeForFinal,
            addResumeForParts,
            assertPatchRequestTimes,
            assertCreateRequestTimes,
            assertLastCreateRequest,
            assertResumeForParts,
        } = createTusIntercepts({ parallel });

        const runAgain = runParallelUpload(parallel, (fileSize, createSize, startFinishEvents) => {
            assertLastCreateRequest(({ request }) => {
                expect(request.headers["upload-concat"])
                    .to.eq(`final;${getPartUrls().join(" ")}`);
                expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(parallelFinalUrl);
            });

            //resume on the file fails so can test resume on parts
            addResumeForFinal(-1);
            addResumeForParts();

            runAgain((fileSize, createSize, startFinishEvents) => {
                expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(parallelFinalUrl);

                assertCreateRequestTimes(4, "should have 4 requests (create, final, resume, final)");

                assertPatchRequestTimes(0, 1, "should only have patch req for the first upload, not for resume");
                assertPatchRequestTimes(1, 1, "should only have patch req for the first upload, not for resume");

                assertResumeForParts();
            });
        });
    });
});
