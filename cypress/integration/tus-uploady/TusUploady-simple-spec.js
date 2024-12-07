import uploadFile from "../uploadFile";
import { createTusIntercepts, uploadUrl } from "./tusIntercept";
import clearTusPersistStorage from "./clearTusPersistStorage";
import { getParallelSizes } from "./runParallerlUpload";

describe("TusUploady - Simple", () => {
	const fileName = "flower.jpg",
        chunkSize = 200_000;

	before(() => {
        clearTusPersistStorage();
        cy.visitStory(
            "tusUploady",
            "simple",
            {
                uploadUrl,
                chunkSize,
                uploadParams: { foo: "bar" },
                tusResumeStorage: true,
                tusIgnoreModifiedDateInStorage: true,
                tusSendWithCustomHeader: true,
            }
        );
	});

	it("should upload chunks using tus protocol", () => {
       const {
           addResumeForParts,
           assertResumeForParts,
           assertCreateRequest,
           assertPatchRequest,
       }  = createTusIntercepts();

		cy.get("input")
			.should("exist")
			.as("fInput");

		uploadFile(fileName, () => {
			cy.waitMedium();
			cy.storyLog().assertFileItemStartFinish(fileName, 1);

            assertCreateRequest(0, ({ request }) => {
                expect(request.headers["x-test"])
                    .to.eq("abcd");

                expect(request.body).to.eq("");
            });

            getParallelSizes(fileName, 1)
                .then(({ fileSize }) => {
                    assertPatchRequest(chunkSize, 0);
                    assertPatchRequest(fileSize - chunkSize, 0);
                });

            addResumeForParts();

			//upload again, should be resumed!
			uploadFile(fileName, () => {
				cy.waitShort();

				cy.storyLog().assertFileItemStartFinish(fileName, 3, true)
					.then((events) => {
						expect(events.finish.args[1].uploadResponse.message).to.eq("TUS server has file");
						expect(events.finish.args[1].uploadResponse.location).to.eq(`${uploadUrl}/111`);
					});

                assertResumeForParts();
			}, "#upload-button");
		}, "#upload-button");
	});
});
