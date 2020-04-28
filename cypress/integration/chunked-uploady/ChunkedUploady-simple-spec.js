import uploadFile from "../uploadFile";

describe("ChunkedUploady - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("chunkedUploady", "simple&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url&knob-chunk size (bytes)_Upload Settings=50000");
    });

    it("should use chunked uploady with unique id", () => {
        //need to wait for storybook to re-render due to knobs passed in URL
        cy.wait(2000);

        cy.server();

        cy.route({
            method: "POST",
            url: "http://test.upload/url",
            response: { success: true }
        }).as("uploadReq");

        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.get("@iframe")
            .find("input")
            .should("exist")
            .as("fInput");

        uploadFile(fileName, () => {
            cy.wait(2000);
            cy.storyLog().assertItemStartFinish(fileName, 1);

            let uniqueHeader;

            cy.wait("@uploadReq")
                .then((xhr) => {
                    uniqueHeader = xhr.request.headers["X-Unique-Upload-Id"];

                    expect(xhr.request.headers["X-Unique-Upload-Id"])
                        .to.match(/rpldy-chunked-uploader-/);

                    expect(xhr.request.headers["Content-Range"])
                        .to.match(/bytes 0-49999\//);
                });

            cy.wait("@uploadReq")
                .then((xhr) => {
                    expect(uniqueHeader).to.be.ok;
                    expect(uniqueHeader).to.equal(xhr.request.headers["X-Unique-Upload-Id"]);

                    expect(xhr.request.headers["Content-Range"])
                        .to.match(/bytes 50000-\d+\//);
                });
        });
    });
});
