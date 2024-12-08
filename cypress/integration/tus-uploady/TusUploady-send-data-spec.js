import { createTusIntercepts, uploadUrl } from "./tusIntercept";
import uploadFile from "../uploadFile";

describe("TusUploady - Send Data", () => {
    const fileName = "flower.jpg";

    const loadStory = (chunkSize) => {
        cy.visitStory(
            "tusUploady",
            "simple",
            {
                uploadUrl,
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

        const {
            assertCreateRequest,
            assertPatchRequestTimes,
        } = createTusIntercepts();

        uploadFile(fileName, () => {
            let fileSize;

            cy.waitMedium();

            cy.get(`@${fileName}`)
                .then((uploadFile) => {
                    fileSize = uploadFile.length;
                    cy.log(`GOT UPLOADED FILE Length ===> ${fileSize}`);
                });

            cy.storyLog()
                .assertFileItemStartFinish(fileName, 1)
                .then((startFinishEvents) => {
                    assertCreateRequest(fileSize, ({ request, response }) => {
                        const loc = response.headers["Location"];

                        expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq(loc);
                        expect(request.headers["content-length"]).to.eq(`${isFileSmallerThanChunk ? fileSize : chunkSize}`);
                    });

                    assertPatchRequestTimes(0, isFileSmallerThanChunk ? 0 : 1, "should have patch request for first chunk only if file-size > chunk-size");
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
