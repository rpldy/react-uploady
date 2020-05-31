import uploadFile from "../uploadFile";

describe("TusUploady - Parallel", () => {
	const fileName = "flower.jpg";

	before(() => {
		cy.visitStory("tusUploady", "with-tus-concatenation&knob-destination_Upload Destination=url&knob-multiple files_Upload Settings=true&knob-chunk size (bytes)_Upload Settings=200000&knob-forget on success_Upload Settings=&knob-upload url_Upload Destination=http://test.tus.com/upload&knob-params_Upload Destination={\"foo\":\"bar\"}&knob-enable resume (storage)_Upload Settings=true");
	});

	it("should upload chunks using tus protocol in parallel", () => {
		//need to wait for storybook to re-render due to knobs passed in URL
		cy.wait(2000);

		cy.server();

		let reqCount = 0;
		const createUrls = ["123", "456"];

		cy.route({
			method: "POST",
			url: "http://test.tus.com/upload",
			response: { success: true },
			headers: {
				"Tus-Resumable": "1.0.0"
			},
			onResponse: (xhr) => {
				let closureCounter = reqCount;
				reqCount += 1;

				const orgGetHeader = xhr.xhr.getResponseHeader;

				xhr.xhr.getResponseHeader = (name) => {
					return (name === "Location") ?
						`http://test.tus.com/upload/${createUrls[closureCounter]}` :
						orgGetHeader.call(this, name);
				};
			},
		}).as("createReq");

		cy.route({
			method: "PATCH",
			url: "http://test.tus.com/upload/123",
			response: { success: true },
			headers: {
				"Tus-Resumable": "1.0.0",
				"Upload-Offset": 200000
			},
		}).as("patchReq1");

		cy.route({
			method: "PATCH",
			url: "http://test.tus.com/upload/456",
			response: { success: true },
			headers: {
				"Tus-Resumable": "1.0.0",
				"Upload-Offset": 175000
			},
		}).as("patchReq2");

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
					expect(xhr.request.headers["Upload-Length"]).to.eq(200000)
				});

			cy.wait("@createReq")
				.then((xhr) => {
					expect(xhr.request.headers["Upload-Length"]).to.eq(172445)
				});

			cy.wait("@patchReq1")
				.then((xhr) => {
					expect(xhr.request.body.name).to.eq(fileName);
				});

			cy.wait("@patchReq2")
				.then((xhr) => {
					expect(xhr.request.body.name).to.eq(fileName);
				});

			cy.wait("@createReq")
				.then((xhr) => {
					expect(xhr.request.headers["Upload-Metadata"])
						.to.eq("foo YmFy");

					expect(xhr.request.headers["Upload-Concat"])
						.to.eq("final;http://test.tus.com/upload/123 http://test.tus.com/upload/456");
				});
		});
	});
});
