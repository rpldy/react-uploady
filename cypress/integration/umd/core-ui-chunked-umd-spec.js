import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("UMD UI CORE - Bundle", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("chunkedUploady", "umd-core-chunked-ui");
    });

    it("should use uploady and upload file", () => {
        intercept("http://localhost:4000/upload");

        uploadFile(fileName, () => {
            let uniqueHeader;

            cy.wait("@uploadReq")
                .then((xhr) => {
                    uniqueHeader = xhr.request.headers["x-unique-upload-id"];

                    expect(xhr.request.headers["x-unique-upload-id"])
                        .to.match(/umd-test-\d/);

                    expect(xhr.request.headers["content-range"])
                        .to.match(/bytes 0-9999\//);
                });

            cy.wait("@uploadReq")
                .then((xhr) => {
                    expect(uniqueHeader).to.be.ok;
                    expect(uniqueHeader).to.equal(xhr.request.headers["x-unique-upload-id"]);

                    expect(xhr.request.headers["content-range"])
                        .to.match(/bytes 10000-\d+\//);
                });

            cy.wait(1000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        }, "#upload-button");
    });
});
