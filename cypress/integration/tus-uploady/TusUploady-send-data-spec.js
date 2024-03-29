import uploadFile from "../uploadFile";
import intercept from "../intercept";
import { WAIT_LONG } from "../../constants";

describe("TusUploady - Send Data", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "tusUploady",
            "simple&knob-multiple files_Upload Settings=true&knob-chunk size (bytes)_Upload Settings=200000&knob-forget on success_Upload Settings=&knob-params_Upload Destination={\"foo\":\"bar\"}&knob-enable resume (storage)_Upload Settings=true&knob-ignore modifiedDate in resume storage_Upload Settings=true&knob-send data on create_Upload Settings=true",
            { useMock: false, uploadUrl: "http://test.tus.com/upload" }
        );
    });

    it("should upload chunks using tus protocol with data on create", () => {
        intercept("http://test.tus.com/upload", "POST", {
            headers: {
                "Location": "http://test.tus.com/upload/123",
                "Tus-Resumable": "1.0.0",
                "Upload-Offset": "200000",
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
            cy.wait(WAIT_LONG);

            cy.storyLog()
                .assertFileItemStartFinish(fileName, 1)
                .then((startFinishEvents) => {
                    cy.wait("@createReq")
                        .then(({ request }) => {
                            expect(request.headers["content-length"]).to.eq("200000");

                            expect(request.headers["upload-metadata"])
                                .to.eq("foo YmFy");

                            expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq("http://test.tus.com/upload/123");
                        });

                    cy.wait("@patchReq")
                        .then(({ request }) => {
                            const { headers } = request;
                            expect(headers["upload-offset"]).to.eq("200000");
                            expect(headers["content-type"]).to.eq("application/offset+octet-stream");
                        });
                });
        }, "#upload-button");
    });
});
