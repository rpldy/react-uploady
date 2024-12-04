import uploadFile from "../uploadFile";
import { createTusIntercepts, parallelFinalUrl } from "./tusIntercept";
import runParallelUpload from "./runParallerlUpload";

describe("TusUploady - Parallel with Data on Create", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "tusUploady",
            "with-tus-concatenation",
            {
                useMock: false,
                uploadUrl: "http://test.tus.com/upload",
                chunkSize: 200000,
                uploadParams: { foo: "bar" },
                tusResumeStorage: true,
                tusSendOnCreate: true,
            }
        );
    });

    it.only("should upload chunks using tus protocol in parallel with data on create, chunk size larger than part size", () => {
        const parallel = 2;
        const {
            assertCreateRequest,
            assertPatchRequestTimes,
            assertParallelFinalRequest,
        } = createTusIntercepts({ parallel });

        runParallelUpload(fileName, parallel, (fileSize, createSize, startFinishEvents) => {
            assertCreateRequest(createSize + 1);
            assertCreateRequest(createSize);

            assertPatchRequestTimes(0, 0, "no patch request needed for part 1");
            assertPatchRequestTimes(1, 0, "no patch request needed for part 2");

            assertParallelFinalRequest(({ request }) => {
                expect(request.headers["upload-metadata"])
                    .to.eq("foo YmFy");
                expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(parallelFinalUrl);
            });
        });
    });

    it("should upload chunks using tus protocol in parallel with data on create, chunk smaller than part", () => {
        const chunkSize = 50_000;
        const parallel = 3;

        const {
            assertCreateRequest,
            assertPatchRequestTimes,
            assertParallelFinalRequest
        } = createTusIntercepts({ parallel });

        cy.setUploadOptions({ chunkSize, parallel });

        runParallelUpload(fileName, parallel, (fileSize, createSize, startFinishEvents) => {
            assertCreateRequest(createSize + 1, ({ request }) => {
                expect(request.headers["content-length"]).to.eq("50000");
            });
            assertCreateRequest(createSize + 1, ({ request }) => {
                expect(request.headers["content-length"]).to.eq("50000");
            });
            assertCreateRequest(createSize - 1, ({ request }) => {
                expect(request.headers["content-length"]).to.eq("50000");
            });

            assertPatchRequestTimes(0, 2, "only two patch requests for part 1, since create received first chunk");
            assertPatchRequestTimes(1, 2, "only two patch requests for part 2, since create received first chunk");
            assertPatchRequestTimes(2, 2, "only two patch requests for part 3, since create received first chunk");

            assertParallelFinalRequest(({ request }) => {
                expect(request.headers["upload-metadata"])
                    .to.eq("foo YmFy");
                expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(parallelFinalUrl);
            });
        });

    });
});
