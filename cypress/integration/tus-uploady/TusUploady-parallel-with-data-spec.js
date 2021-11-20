import uploadFile from "../uploadFile";
import { WAIT_LONG } from "../specWaitTimes";

describe("TusUploady - Parallel with Data on Create", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("tusUploady", "with-tus-concatenation&knob-destination_Upload Destination=url&knob-multiple files_Upload Settings=true&knob-chunk size (bytes)_Upload Settings=200000&knob-forget on success_Upload Settings=&knob-upload url_Upload Destination=http://test.tus.com/upload&knob-params_Upload Destination={\"foo\":\"bar\"}&knob-enable resume (storage)_Upload Settings=true&knob-send data on create_Upload Settings=true");
    });

    it("should upload chunks using tus protocol in parallel with data on create", () => {
        let reqCount = 0;
        const createUrls = ["123", "456", "final"],
            createOffsets = [200000, 172445];

        cy.intercept("POST", "http://test.tus.com/upload", (req) => {
            req.reply(200, { success: true }, {
                "Location": `http://test.tus.com/upload/${createUrls[reqCount]}`,
                "Upload-Offset": `${createOffsets[reqCount]}`,
                "Tus-Resumable": "1.0.0",
            });

            reqCount += 1;
        }).as("createReq");

        cy.get("input")
            .should("exist")
            .as("fInput");

        uploadFile(fileName, () => {
            cy.wait(WAIT_LONG);

            cy.log("ABOUT TO CHECK STORY LOG");

            cy.storyLog()
                .assertFileItemStartFinish(fileName, 1)
                .then((startFinishEvents) => {
                    cy.wait("@createReq")
                        .then((xhr) => {
                            expect(xhr.request.headers["upload-length"]).to.eq("200000");
                        });

                    cy.wait("@createReq")
                        .then((xhr) => {
                            expect(xhr.request.headers["upload-length"]).to.eq("172445");
                        });

                    cy.wait("@createReq")
                        .then((xhr) => {
                            expect(xhr.request.headers["upload-metadata"])
                                .to.eq("foo YmFy");

                            expect(xhr.request.headers["upload-concat"])
                                .to.eq("final;http://test.tus.com/upload/123 http://test.tus.com/upload/456");
                        });

                    expect(startFinishEvents.finish.args[1].uploadResponse.location).to.eq("http://test.tus.com/upload/final");
                });
        });
    });
});
