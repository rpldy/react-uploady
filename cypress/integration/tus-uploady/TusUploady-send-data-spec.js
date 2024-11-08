import uploadFile from "../uploadFile";
import intercept from "../intercept";

describe("TusUploady - Send Data", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "tusUploady",
            "simple",
            {
                uploadUrl: "http://test.tus.com/upload",
                chunkSize: 200000,
                uploadParams: { foo: "bar" },
                tusResumeStorage: true,
                tusIgnoreModifiedDateInStorage: true,
                tusSendOnCreate: true,
            }
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
            cy.waitMedium();

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
