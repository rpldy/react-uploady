import uploadFile from "../uploadFile";
import { createTusIntercepts, parallelFinalUrl, uploadUrl } from "./tusIntercept";
import clearTusPersistStorage from "./clearTusPersistStorage";
import runParallelUpload from "./runParallerlUpload";

describe("TusUploady - Resume Event", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        clearTusPersistStorage();

        cy.visitStory(
            "tusUploady",
            "with-resume-start-handler",
            {
                useMock: false,
                uploadUrl,
                chunkSize: 100_000,
                uploadParams: { foo: "bar" },
                tusResumeStorage: true,
                tusIgnoreModifiedDateInStorage: true,
                tusSendWithCustomHeader: true,
            }
        );
    });

    it("should request tus resume with resumeHeaders", () => {
        const {
            addResumeForParts,
            assertResumeForParts,
            assertCreateRequest,
            getPartUrls
        } = createTusIntercepts();

        uploadFile(fileName, () => {
            cy.waitMedium();
            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            assertCreateRequest(0, ({ request }) => {
                expect(request.headers["x-test"])
                    .to.eq("abcd");

                expect(request.body).to.eq("");
            });

            addResumeForParts();

            //upload again, should be resumed!
            uploadFile(fileName, () => {
                cy.waitShort();

                cy.storyLog().assertFileItemStartFinish(fileName, 5)
                    .then((events) => {
                        expect(events.finish.args[1].uploadResponse.message).to.eq("TUS server has file");
                        expect(events.finish.args[1].uploadResponse.location).to.eq(getPartUrls()[0]);
                    });

                assertResumeForParts(({ request }) => {
                    const { headers } = request;
                    //these are added by the resume event handler
                    expect(headers["x-test-resume"]).to.eq("123");
                    expect(headers["x-another-header"]).to.eq("foo");
                    expect(headers["x-test-override"]).to.eq("def");
                });
            }, "#upload-button");
        }, "#upload-button");
    });

    it("should cancel tus resume", () => {
        cy.setUploadOptions({ tusCancelResume: true });

        const {
            addResumeForParts,
            assertCreateRequest,
        } = createTusIntercepts();

        uploadFile(fileName, () => {
            cy.waitMedium();
            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            assertCreateRequest(0, ({ request }) => {
                expect(request.headers["x-test"])
                    .to.eq("abcd");

                expect(request.body).to.eq("");
            });

            // addResumeForParts();
            const secondTus = createTusIntercepts();

            //upload again, should be resumed and resume will be cancelled!
            uploadFile(fileName, () => {
                cy.waitMedium();
                cy.storyLog().assertFileItemStartFinish(fileName, 5);

                secondTus.assertCreateRequest(0, ({ request }) => {
                    expect(request.headers["x-test"])
                        .to.eq("abcd");

                    expect(request.body).to.eq("");
                });

                secondTus.assertPatchRequestTimes(0, 4, "should do the same patch requests for the second time with resume cancelled");
            }, "#upload-button");
        }, "#upload-button");
    });

    it("should cancel tus resume with parallel", () => {
        const parallel = 2;
        cy.setUploadOptions({ tusCancelResume: true, parallel });

        const {
            assertCreateRequest,
            assertPatchRequestTimes,
            assertParallelFinalRequest,
        } = createTusIntercepts({ parallel });

        const runUploadAgain = runParallelUpload(fileName, parallel, (fileSize, createSize, startFinishEvents) => {
            assertCreateRequest(createSize + 1);
            assertCreateRequest(createSize);

            assertPatchRequestTimes(0,2);
            assertPatchRequestTimes(1,2);

            assertParallelFinalRequest(({ request }) => {
                expect(request.headers["upload-metadata"])
                    .to.eq("foo YmFy");
                expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(parallelFinalUrl);
            });

            const secondTus = createTusIntercepts({ parallel });

            //upload again, should be resumed and resume will be cancelled!
            runUploadAgain((fileSize, createSize, startFinishEvents) => {
                secondTus.assertCreateRequest(createSize + 1);
                secondTus.assertCreateRequest(createSize);

                secondTus.assertPatchRequestTimes(0,2);
                secondTus.assertPatchRequestTimes(1,2);

                secondTus.assertParallelFinalRequest(({ request }) => {
                    expect(request.headers["upload-metadata"])
                        .to.eq("foo YmFy");
                    expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(parallelFinalUrl);
                });
            });
        });
    });
});
