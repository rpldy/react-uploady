import uploadFile from "../uploadFile";

describe("TusUploady - Parallel with Data on Create", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "tusUploady",
            "with-tus-concatenation",
            {
                useMock: false,
                uploadUrl: "http://test.tus.com/upload",
                chunkSize: 200000,
                uploadParams: { foo: "bar" },
                tusResumeStorage: true,
                tusSendOnCreate: true,
            }
        );
    });

    it("should upload chunks using tus protocol in parallel with data on create", () => {
        let reqCount = 0;
        const createUrls = ["123", "456", "final"];

        cy.intercept("POST", "http://test.tus.com/upload", (req) => {
            req.reply(200, { success: true }, {
                "Location": `http://test.tus.com/upload/${createUrls[reqCount]}`,
                "Upload-Offset":  req.headers["content-length"],
                "Tus-Resumable": "1.0.0",
            });

            reqCount += 1;
        }).as("createReq");

        cy.get("input")
            .should("exist")
            .as("fInput");

        uploadFile(fileName, () => {
            cy.wait("@createReq")
                .then((xhr) => {
                    expect(xhr.request.headers["content-length"]).to.eq("200000");
                });

            cy.wait("@createReq")
                .then((xhr) => {
                    expect(xhr.request.headers["content-length"]).to.eq("172445");
                });

            cy.waitShort();

            cy.storyLog()
                .assertFileItemStartFinish(fileName, 1)
                .then((startFinishEvents) => {
                    expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq("http://test.tus.com/upload/final");
                });

            cy.wait("@createReq")
                .then((xhr) => {
                    expect(xhr.request.headers["upload-metadata"])
                        .to.eq("foo YmFy");

                    const concatHeader = xhr.request.headers["upload-concat"];
                    expect(concatHeader)
                        .to.contain("final;");

                    expect(concatHeader)
                        .to.contain("http://test.tus.com/upload/123");

                    expect(concatHeader)
                        .to.contain("http://test.tus.com/upload/456");
                });
        });
    });
});
