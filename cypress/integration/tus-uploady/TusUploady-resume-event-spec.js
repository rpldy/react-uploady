import uploadFile from "../uploadFile";
import { tusIntercept } from "./tusIntercept";

describe("TusUploady - Simple", () => {
    const fileName = "flower.jpg",
        uploadUrl = "http://test.tus.com/upload";

    const loadPage = () =>
        cy.visitStory(
            "tusUploady",
            "with-resume-start-handler",
            {
                useMock: false,
                uploadUrl,
                chunkSize: 200000,
                uploadParams: { foo: "bar" },
                tusResumeStorage: true,
                tusIgnoreModifiedDateInStorage: true,
                tusSendWithCustomHeader: true,
            }
        );

    const assertNewFileRequests = () => {
        cy.wait("@createReq")
            .then((xhr) => {
                expect(xhr.request.headers["upload-metadata"])
                    .to.eq("foo YmFy");

                expect(xhr.request.headers["x-test"])
                    .to.eq("abcd");

                expect(xhr.request.body).to.eq("");
            });

        cy.wait("@patchReq")
            .then(({ request }) => {
                const { headers } = request;
                expect(headers["content-length"]).to.eq("200000");
                expect(headers["content-type"]).to.eq("application/offset+octet-stream");
            });

        cy.wait("@patchReq")
            .then(({ request }) => {
                const { headers } = request;
                expect(headers["upload-offset"]).to.eq("200000");
                expect(headers["content-type"]).to.eq("application/offset+octet-stream");
            });
    } ;

    it("should request tus resume with resumeHeaders", () => {
        loadPage();
        tusIntercept(uploadUrl);

        uploadFile(fileName, () => {
            cy.waitMedium();
            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            assertNewFileRequests();

            //upload again, should be resumed!
            uploadFile(fileName, () => {
                cy.waitShort();

                cy.storyLog().assertFileItemStartFinish(fileName, 5)
                    .then((events) => {
                        expect(events.finish.args[1].uploadResponse.message).to.eq("TUS server has file");
                        expect(events.finish.args[1].uploadResponse.location).to.eq(`${uploadUrl}/123`);
                    });

                cy.wait("@resumeReq")
                    .then(({ request }) => {
                        const { headers } = request;
                        expect(headers["tus-resumable"]).to.eq("1.0.0");
                        expect(headers["x-test-resume"]).to.eq("123");
                        expect(headers["x-another-header"]).to.eq("foo");
                        expect(headers["x-test-override"]).to.eq("def");
                    });
            }, "#upload-button");
        }, "#upload-button");
    });

    it("should cancel tus resume", () => {
        loadPage();
        cy.setUploadOptions({
            tusCancelResume: true,
        });

        tusIntercept(uploadUrl);

        uploadFile(fileName, () => {
            cy.waitMedium();
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            assertNewFileRequests();

            //upload again, should be resumed!
            uploadFile(fileName, () => {
                cy.waitMedium();
                cy.storyLog().assertFileItemStartFinish(fileName, 5);
                assertNewFileRequests();

                cy.get("@resumeReq")
                    .then((req) => {
                       expect(req).to.be.null;
                    })
            }, "#upload-button");
        }, "#upload-button");
    });
});
