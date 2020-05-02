import uploadFile from "../uploadFile";

describe("UMD UI CORE - Bundle", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("chunkedUploady", "umd-core-chunked-ui");
    });

    it("should use uploady and upload file", () => {
        cy.server();

        cy.route({
            method: "POST",
            url: "http://localhost:4000/upload",
            response: { success: true }
        }).as("uploadReq");

        cy.iframe("#storybook-preview-iframe").as("iframe");

        uploadFile(fileName, () => {
            cy.wait(2000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            let uniqueHeader;

            cy.wait("@uploadReq")
                .then((xhr) => {
                    uniqueHeader = xhr.request.headers["X-Unique-Upload-Id"];

                    expect(xhr.request.headers["X-Unique-Upload-Id"])
                        .to.match(/umd-test-\d/);

                    expect(xhr.request.headers["Content-Range"])
                        .to.match(/bytes 0-9999\//);
                });

            cy.wait("@uploadReq")
                .then((xhr) => {
                    expect(uniqueHeader).to.be.ok;
                    expect(uniqueHeader).to.equal(xhr.request.headers["X-Unique-Upload-Id"]);

                    expect(xhr.request.headers["Content-Range"])
                        .to.match(/bytes 10000-\d+\//);
                });

        }, "#upload-button");
    });
});
