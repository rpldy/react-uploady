import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("Uploady - Custom Response Formatter", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory(
            "uploady",
            "with-custom-response-format",
            { useMock: false }
        );
    });

    it("should use custom response formatter function", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.wait("@uploadReq");

            cy.storyLog().assertLogEntryContains(2, {
               uploadResponse: {
                   data: "200 - Yay!"
               }
            });
        });
    });
});
