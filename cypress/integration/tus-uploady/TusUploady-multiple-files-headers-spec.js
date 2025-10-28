import uploadFile from "../uploadFile";
import { createTusIntercepts, uploadUrl } from "./tusIntercept";
import clearTusPersistStorage from "./clearTusPersistStorage";

describe("TusUploady - Multiple Files Same Headers", () => {
    const fileName = "flower.jpg";
    const chunkSize = 122_445;//172445;

    const setupEventHandlers = (withPartStart = false) => {
        let bearerToken = 0;

        cy.setUploadOptions({
            preSendData: ({ options, items }) => {
                bearerToken += 1;
                return {
                    options: {
                        params: { [`TestParam-${items[0].id}`]: items[0].file.name },
                        destination: {
                            headers: { "Authorization": "bearer " + bearerToken },
                        }
                    }
                }
            },
            partStartData: withPartStart ? (data) => {
                const { chunk } = data;
                const authHeaderVal = data.headers["Authorization"];

                return {
                    headers: {
                        "Authorization": authHeaderVal + "-part-" + (chunk.index + 1),
                    }
                };
            } : undefined
        });
    };

    beforeEach(() => {
        clearTusPersistStorage();

        cy.visitStory(
            "tusUploady",
            "simple",
            {
                uploadUrl,
                chunkSize,
                forgetOnSuccess: true,
                tusSendOnCreate: true,
                tusResumeStorage: true,
                tusIgnoreModifiedDateInStorage: true,
                tusSendWithCustomHeader: true,
            }
        );
    });

    it.skip("should upload multiple files in a single batch with unique header/param for upload request", () => {
        const numberOfFiles = 3;

        setupEventHandlers();

        const {
            assertCreateRequest,
            assertPatchRequest,
            assertCreateRequestByIndex,
            assertCreateRequestTimes,
            assertLastCreateRequest,
        } = createTusIntercepts({ batchSize: numberOfFiles, chunkSize,  });

        cy.get("input")
            .should("exist")
            .as("fInput");

        // Upload multiple files in a single batch
        uploadFile(fileName, () => {
            cy.waitShort();

            // Verify all files started and finished
            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            // Verify we got the expected number of CREATE requests (one per file)
            assertCreateRequestTimes(numberOfFiles, `Should have ${numberOfFiles} CREATE requests for ${numberOfFiles} files`);

            // Use the working x-test header to verify header consistency across files
            // Assert first CREATE request has the Authorization header as requested
            assertCreateRequest(0, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 1", "First file CREATE request should have Authorization header");
                expect(request.headers["x-test"]).to.eq("abcd", "Should also have the predefined x-test header");
                expect(request.headers["upload-metadata"]).to.contain("TestParam-batch-1.item-1", "Should have unique TestParam metadata for the first file");
                expect(request.headers["tus-resumable"]).to.eq("1.0.0");
                // With sendDataOnCreate, content-length should be > 0
                if (request.headers["content-length"]) {
                    expect(parseInt(request.headers["content-length"])).to.be.greaterThan(0);
                }
            });

            // Assert last CREATE request also has the same Authorization header to verify consistency across multiple files
            assertCreateRequestByIndex(1, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 2", "Second file CREATE request should have same Authorization header");
                expect(request.headers["upload-metadata"]).to.contain("TestParam-batch-1.item-2", "Should have unique TestParam metadata for the second file");
                expect(request.headers["x-test"]).to.eq("abcd", "Should also have the predefined x-test header");
                expect(request.headers["tus-resumable"]).to.eq("1.0.0");
            });

            cy.waitExtraShort();

            assertLastCreateRequest(({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 3", "Last file CREATE request should have same Authorization header");
                expect(request.headers["upload-metadata"]).to.contain("TestParam-batch-1.item-3", "Should have unique TestParam metadata for the third file");
                expect(request.headers["x-test"]).to.eq("abcd", "Should also have the predefined x-test header");
                expect(request.headers["tus-resumable"]).to.eq("1.0.0");
            });

            // Assert PATCH requests have consistent authorization header from resumeHeaders
            assertPatchRequest(chunkSize, 0, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 1", "PATCH request should have Authorization header from resumeHeaders");
                expect(request.headers["content-type"]).to.eq("application/offset+octet-stream");
                expect(request.headers["upload-offset"]).to.be.a("string");
                expect(request.headers["tus-resumable"]).to.eq("1.0.0");
            });

            assertPatchRequest(chunkSize, 1, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 2", "PATCH request should have Authorization header from resumeHeaders");
                expect(request.headers["content-type"]).to.eq("application/offset+octet-stream");
                expect(request.headers["upload-offset"]).to.be.a("string");
                expect(request.headers["tus-resumable"]).to.eq("1.0.0");
            });

            assertPatchRequest(chunkSize, 2, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 3", "PATCH request should have Authorization header from resumeHeaders");
                expect(request.headers["upload-offset"]).to.be.a("string");
                expect(request.headers["tus-resumable"]).to.eq("1.0.0");
            });

        }, "#upload-button", { times: numberOfFiles });
    });

    it("should upload multiple files with multiple parts each with their own unique header", () => {
        const numberOfFiles = 2;

        setupEventHandlers(true);

        const {
            assertCreateRequest,
            assertPatchRequest,
            assertCreateRequestByIndex,
            assertCreateRequestTimes,
            assertLastCreateRequest,
        } = createTusIntercepts({ batchSize: numberOfFiles  });

        cy.get("input")
            .should("exist")
            .as("fInput");

        // Upload multiple files in a single batch
        uploadFile(fileName, () => {
            cy.waitShort();

            // Verify all files started and finished
            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            // Verify we got the expected number of CREATE requests (one per file)
            assertCreateRequestTimes(numberOfFiles, `Should have ${numberOfFiles} CREATE requests for ${numberOfFiles} files`);

            assertCreateRequest(0, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 1", "First file CREATE request should have Authorization header");
                expect(request.headers["x-test"]).to.eq("abcd", "Should also have the predefined x-test header");
                expect(request.headers["upload-metadata"]).to.contain("TestParam-batch-1.item-1", "Should have unique TestParam metadata for the first file");
                expect(request.headers["tus-resumable"]).to.eq("1.0.0");
                // With sendDataOnCreate, content-length should be > 0
                if (request.headers["content-length"]) {
                    expect(parseInt(request.headers["content-length"])).to.be.greaterThan(0);
                }
            });

            assertPatchRequest(chunkSize, 0, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 1-part-1", "PATCH request should have unique Authorization header from part start handler");
                expect(request.headers["upload-offset"]).to.be.a("string");
                expect(request.headers["tus-resumable"]).to.eq("1.0.0");
            });

            assertPatchRequest(chunkSize, 0, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 1-part-2", "PATCH request should have unique Authorization header from part start handler");
            });

            //dont use chunk size for last part as it will be smaller
            assertPatchRequest(0, 0, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 1-part-3", "PATCH request should have unique Authorization header from part start handler");
            });

            assertCreateRequestByIndex(1, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 2", "First file CREATE request should have Authorization header");
                expect(request.headers["x-test"]).to.eq("abcd", "Should also have the predefined x-test header");
                expect(request.headers["upload-metadata"]).to.contain("TestParam-batch-1.item-2", "Should have unique TestParam metadata for the first file");
                expect(request.headers["tus-resumable"]).to.eq("1.0.0");
                // With sendDataOnCreate, content-length should be > 0
                if (request.headers["content-length"]) {
                    expect(parseInt(request.headers["content-length"])).to.be.greaterThan(0);
                }
            });

            assertPatchRequest(chunkSize, 1, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 2-part-1", "PATCH request should have unique Authorization header from part start handler");
                expect(request.headers["upload-offset"]).to.be.a("string");
                expect(request.headers["tus-resumable"]).to.eq("1.0.0");
            });

            assertPatchRequest(chunkSize, 1, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 2-part-2", "PATCH request should have unique Authorization header from part start handler");
            });

            //dont use chunk size for last part as it will be smaller
            assertPatchRequest(0, 1, ({ request }) => {
                expect(request.headers["authorization"]).to.eq("bearer 2-part-3", "PATCH request should have unique Authorization header from part start handler");
            });

        }, "#upload-button", { times: numberOfFiles });
    });
});
