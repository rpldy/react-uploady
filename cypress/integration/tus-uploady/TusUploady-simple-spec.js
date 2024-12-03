import uploadFile from "../uploadFile";
import { createTusIntercepts } from "./tusIntercept";
import clearTusPersistStorage from "./clearTusPersistStorage";

describe("TusUploady - Simple", () => {
	const fileName = "flower.jpg",
        uploadUrl = "http://test.tus.com/upload";

	before(() => {
        clearTusPersistStorage();
        cy.visitStory(
            "tusUploady",
            "simple",
            {
                uploadUrl,
                chunkSize: 200000,
                uploadParams: { foo: "bar" },
                tusResumeStorage: true,
                tusIgnoreModifiedDateInStorage: true,
                tusSendWithCustomHeader: true,
            }
        );
	});

	it("should upload chunks using tus protocol", () => {
       const { addResumeForParts, assertResumeForParts }  = createTusIntercepts();

		cy.get("input")
			.should("exist")
			.as("fInput");

		uploadFile(fileName, () => {
			cy.waitMedium();
			cy.storyLog().assertFileItemStartFinish(fileName, 1);

			cy.wait("@tusCreateReq")
				.then((xhr) => {
					expect(xhr.request.headers["upload-metadata"])
						.to.eq("foo YmFy");

					expect(xhr.request.headers["x-test"])
						.to.eq("abcd");

					expect(xhr.request.body).to.eq("");
				});

			cy.wait("@tusPatchReq1")
                .then(({ request }) => {
                    const { headers } = request;
                    expect(headers["content-length"]).to.eq("200000");
                    expect(headers["content-type"]).to.eq("application/offset+octet-stream");
                });

            cy.wait("@tusPatchReq1")
                .then(({ request }) => {
                    const { headers } = request;
                    expect(headers["upload-offset"]).to.eq("200000");
                    expect(headers["content-type"]).to.eq("application/offset+octet-stream");
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
