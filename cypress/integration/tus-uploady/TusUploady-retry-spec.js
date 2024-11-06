import intercept, { interceptWithDelay } from "../intercept";
import uploadFile from "../uploadFile";
import { ITEM_ABORT, ITEM_FINISH } from "../../constants";

describe("TusUploady - With Retry", () => {
    const fileName = "flower.jpg",
        uploadUrl = "http://test.tus.com/upload";

    before(() => {
        cy.visitStory(
            "tusUploady",
            "with-retry",
            {
                useMock: false,
                uploadUrl,
                chunkSize: 100000,
                uploadParams: { foo: "bar" },
                tusResumeStorage: true,
                tusIgnoreModifiedDateInStorage: true,
                tusSendWithCustomHeader: true,
            }
        );
    });

    it("should resume after failed upload", () => {
        intercept(uploadUrl, "POST", {
            headers: {
                "Location": `${uploadUrl}/123`,
                "Tus-Resumable": "1.0.0"
            }
        }, "createReq");

        interceptWithDelay(
            160,
            "patchReq",
            `${uploadUrl}/123`,
            "PATCH",
            {
                headers: {
                    "Tus-Resumable": "1.0.0",
                },
            }
        );

        uploadFile(fileName, () => {
            //must be 150... dont ask why
            cy.wait(150);

            cy.get("#abort-btn").click();

            cy.storyLog().assertLogPattern(ITEM_ABORT, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 0 });

            cy.wait("@patchReq")
                .then(({ request }) => {
                    const { headers } = request;
                    expect(headers["upload-offset"]).to.eq("0");
                    expect(headers["content-type"]).to.eq("application/offset+octet-stream");
                });

            //made-up resume offset so we know resume happened after failure
            const resumeOffset = "200123"

            intercept(`${uploadUrl}/123`, "HEAD", {
                headers: {
                    "Tus-Resumable": "1.0.0",
                    "Upload-Offset": resumeOffset,
                    "Upload-Length": "372445",
                },
            }, "resumeReq");

            cy.waitShort();

            //retry aborted
            cy.get("#retry-tus-btn").click();

            cy.waitMedium();

            cy.storyLog().assertFileItemStartFinish(fileName, 4, true)
                .then((events) => {
                    expect(events.finish.args[1].uploadResponse.location).to.eq(`${uploadUrl}/123`);
                });

            cy.wait("@patchReq")
                .then(({ request }) => {
                    const { headers } = request;
                    expect(headers["upload-offset"]).to.eq(resumeOffset);
                    expect(headers["content-type"]).to.eq("application/offset+octet-stream");
                });
        }, "#upload-button");

    });
});
