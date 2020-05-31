import uploadFile from "../uploadFile";

describe("TusUploady - Simple", () => {
	const fileName = "flower.jpg";

	before(() => {
		cy.visitStory("tusUploady", "simple&knob-destination_Upload Destination=url&knob-multiple files_Upload Settings=true&knob-chunk size (bytes)_Upload Settings=200000&knob-forget on success_Upload Settings=&knob-upload url_Upload Destination=http://test.tus.com/upload&knob-params_Upload Destination={\"foo\":\"bar\"}&knob-enable resume (storage)_Upload Settings=true&knob-ignore modifiedDate in resume storage_Upload Settings=true&knob-send data on create_Upload Settings=true");
	});

	it("should upload chunks using tus protocol with data on create", () => {
		//need to wait for storybook to re-render due to knobs passed in URL
		cy.wait(2000);

		cy.server();

		cy.route({
			method: "POST",
			url: "http://test.tus.com/upload",
			response: { success: true },
			headers: {
				"Location": "http://test.tus.com/upload/123",
				"Tus-Resumable": "1.0.0",
				"Upload-Offset": 200000,
			}
		}).as("createReq");

		// let serverOffset = 0;

		cy.route({
			method: "PATCH",
			url: "http://test.tus.com/upload/123",
			response: { success: true },
			headers: {
				"Tus-Resumable": "1.0.0",
			},
		}).as("patchReq");

		cy.iframe("#storybook-preview-iframe").as("iframe");

		cy.get("@iframe")
			.find("input")
			.should("exist")
			.as("fInput");

		uploadFile(fileName, () => {
			cy.wait(2000);
			cy.storyLog().assertFileItemStartFinish(fileName, 1);

			cy.wait("@createReq")
				.then((xhr) => {
					expect(xhr.request.headers["Upload-Metadata"])
						.to.eq("foo YmFy");

					expect(xhr.request.body.name).to.eq(fileName);
				});

			cy.wait("@patchReq")
				.then((xhr) => {
					expect(xhr.request.body.name).to.eq(fileName);
				});

			// cy.wait("@patchReq")
			// 	.then((xhr) => {
			// 		expect(xhr.request.body.name).to.eq(fileName);
			// 	});

			// cy.route({
			// 	method: "HEAD",
			// 	url: "http://test.tus.com/upload/123",
			// 	response: { success: true },
			// 	headers: {
			// 		"Tus-Resumable": "1.0.0",
			// 		"Upload-Offset": 1,
			// 		"Upload-Length": 1,
			// 	},
			// });
			//
			// //upload again, should be resumed!
			// uploadFile(fileName, () => {
			// 	cy.wait(2000);
			//
			// 	cy.storyLog().assertFileItemStartFinish(fileName, 4)
			// 		.then((events) => {
			// 			expect(events.finish.args[1].uploadResponse).to.eq("TUS server has file");
			// 		});
			// });
		});
	});
});
