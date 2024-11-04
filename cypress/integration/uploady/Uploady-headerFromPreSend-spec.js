import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("Uploady - Header from RequestPreSend hook", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory(
            "uploady",
            "with-header-from-file-name",
            { useMock: false }
        );
    });

    it("should create a header from pre send hook using file name", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")
                .then((xhr) => {
                    cy.storyLog().assertLogEntryContains(2, {
                        uploadResponse: {
                            data: { success: true }
                        }
                    });

                    expect(xhr.request.headers["x-file-names-lengths"]).to.equal("10");
                });
        });
    });
});
