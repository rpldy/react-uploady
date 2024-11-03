import intercept  from "../intercept";
import uploadFile from "../uploadFile";
import { UPLOAD_URL } from "../../constants";

describe("UMD UI CHUNKED - Bundle", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory("chunkedUploady", "umd-core-chunked-ui");
    });

    it("should use uploady and upload file", () => {
        intercept(UPLOAD_URL);

        uploadFile(fileName, () => {
            let uniqueHeader;

            cy.wait("@uploadReq")
                .then((xhr) => {
                    uniqueHeader = xhr.request.headers["x-unique-upload-id"];

                    expect(xhr.request.headers["x-unique-upload-id"])
                        .to.match(/umd-test-\d/);

                    expect(xhr.request.headers["content-range"])
                        .to.match(/bytes 0-199999\//);
                });

            cy.wait("@uploadReq")
                .then((xhr) => {
                    expect(uniqueHeader).to.be.ok;
                    expect(uniqueHeader).to.equal(xhr.request.headers["x-unique-upload-id"]);

                    expect(xhr.request.headers["content-range"])
                        .to.match(/bytes 200000-\d+\//);
                });

            cy.waitExtraShort();

            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        }, "#upload-button");
    });
});
