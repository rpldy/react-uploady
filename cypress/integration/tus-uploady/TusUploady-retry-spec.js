import { ITEM_ABORT, ITEM_FINISH } from "../../constants";
import uploadFile from "../uploadFile";
import { createTusIntercepts, parallelFinalUrl, uploadUrl } from "./tusIntercept";
import clearTusPersistStorage from "./clearTusPersistStorage";
import { getParallelSizes } from "./runParallerlUpload";

describe("TusUploady - With Retry", () => {
    const fileName = "flower.jpg";
    const chunkSize = 100_000;

    beforeEach(() => {
        cy.visitStory(
            "tusUploady",
            "with-retry",
            {
                useMock: false,
                uploadUrl,
                chunkSize,
                uploadParams: { foo: "bar" },
                tusResumeStorage: true,
                tusIgnoreModifiedDateInStorage: true,
                tusSendWithCustomHeader: true,
            }
        );

        clearTusPersistStorage();
    });

    it("should resume after failed upload, no parallel", () => {
        const {
            addResumeForParts,
            assertPatchRequestTimes,
            assertCreateRequest,
            assertPatchRequest,
        } = createTusIntercepts({
            patchDelay: 160,
        });

        uploadFile(fileName, () => {
            let fileSize;
            //must be 150... dont ask why
            cy.wait(150);

            cy.get("#abort-btn").click();

            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });

            assertPatchRequestTimes(0, 1);

            //made-up resume offset so we know resume happened after failure
            const resumeOffset = "200123";

            addResumeForParts([resumeOffset]);

            cy.waitShort();

            //retry aborted
            cy.get("#retry-tus-btn").click();

            cy.waitMedium();

            cy.get(`@${fileName}`)
                .then((uploadFile) => {
                    fileSize = uploadFile.length;
                    cy.log(`GOT UPLOADED FILE Length ===> ${fileSize}`);
                });

            cy.storyLog().assertFileItemStartFinish(fileName, 4, true)
                .then((events) => {
                    assertCreateRequest(fileSize, ({ request, response }) => {
                        const loc = response.headers["Location"];
                        expect(events.finish.args[1].uploadResponse.location).to.eq(loc);
                    });
                });

            assertPatchRequest(chunkSize, 0, ({ request }) => {
                expect(request.headers["upload-offset"]).to.eq("0", "first patch before cancel");
            });

            assertPatchRequest(chunkSize, 0, ({ request }) => {
                expect(request.headers["upload-offset"]).to.eq(`${resumeOffset}`, "second time after retry");
            });
        }, "#upload-button");
    });

    it("should resume after failed upload, with parallel", () => {
        const parallel = 2;

        const {
            assertCreateRequest,
            assertPatchRequestTimes,
            assertParallelFinalRequest,
            addResumeForParts,
        } = createTusIntercepts({ parallel, patchDelay: 210 });

        cy.setUploadOptions({ parallel });

        uploadFile(fileName, () => {
            cy.wait(150);

            cy.get("#abort-btn").click();

            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });

            addResumeForParts();

            cy.waitShort();

            assertPatchRequestTimes(0, 1, "only one patch call should happen before cancel");
            assertPatchRequestTimes(1, 1, "only one patch call should happen before cancel");

            //retry aborted
            cy.get("#retry-tus-btn").click();

            cy.waitMedium();

            assertPatchRequestTimes(0, 2);
            assertPatchRequestTimes(1, 2);

            cy.storyLog()
                .assertFileItemStartFinish(fileName, 6)
                .then((startFinishEvents) => {

                    getParallelSizes(fileName, parallel)
                        .then((sizes) => {
                            const partSize = sizes.partSize;
                            assertCreateRequest(partSize + 1);
                            assertCreateRequest(partSize);

                            expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(parallelFinalUrl);

                            assertParallelFinalRequest(({ request }) => {
                                expect(request.headers["upload-metadata"])
                                    .to.eq("foo YmFy");
                            });
                        });
                });
        }, "#upload-button");
    });
});
