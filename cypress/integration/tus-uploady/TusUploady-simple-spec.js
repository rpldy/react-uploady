import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { WAIT_SHORT } from "../specWaitTimes";

describe("TusUploady - Simple", () => {
	const fileName = "flower.jpg";

	before(() => {
		cy.visitStory("tusUploady", "simple&knob-destination_Upload Destination=url&knob-multiple files_Upload Settings=true&knob-chunk size (bytes)_Upload Settings=200000&knob-forget on success_Upload Settings=&knob-upload url_Upload Destination=http://test.tus.com/upload&knob-params_Upload Destination={\"foo\":\"bar\"}&knob-enable resume (storage)_Upload Settings=true&knob-ignore modifiedDate in resume storage_Upload Settings=true&knob-send custom header_Upload Settings=true");
	});

	it("should upload chunks using tus protocol", () => {

        intercept("http://test.tus.com/upload", "POST", {
            headers: {
                "Location": "http://test.tus.com/upload/123",
                "Tus-Resumable": "1.0.0"
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
			cy.wait(WAIT_SHORT);
			cy.storyLog().assertFileItemStartFinish(fileName, 1);

			cy.wait("@createReq")
				.then((xhr) => {
					expect(xhr.request.headers["upload-metadata"])
						.to.eq("foo YmFy");

					expect(xhr.request.headers["x-test"])
						.to.eq("abcd");

					expect(xhr.request.body).to.eq("");
				});

			cy.wait("@patchReq")
                .then(({ request }) => {
                    const { headers } = request;
                    expect(headers["content-length"]).to.eq("200000");
                    expect(headers["content-type"]).to.eq("application/offset+octet-stream");
                });

            cy.wait("@patchReq")
                .then(({ request }) => {
                    const { headers } = request;
                    expect(headers["upload-offset"]).to.eq("200000");
                    expect(headers["content-type"]).to.eq("application/offset+octet-stream");
                });

            intercept("http://test.tus.com/upload/123", "HEAD", {
                headers: {
                    "Tus-Resumable": "1.0.0",
                    "Upload-Offset": "1",
                    "Upload-Length": "1",
                },
            }, "finishReq");

			//upload again, should be resumed!
			uploadFile(fileName, () => {
				cy.wait(WAIT_SHORT);

				cy.storyLog().assertFileItemStartFinish(fileName, 4)
					.then((events) => {
						expect(events.finish.args[1].uploadResponse.message).to.eq("TUS server has file");
						expect(events.finish.args[1].uploadResponse.location).to.eq("http://test.tus.com/upload/123");
					});
			}, "#upload-button");
		}, "#upload-button");
	});
});
