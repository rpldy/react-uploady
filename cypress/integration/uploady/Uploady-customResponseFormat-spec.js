import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { UPLOAD_URL } from "../../constants";

describe("Uploady - Custom Response Formatter", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory(
            "uploady",
            "with-custom-response-format",
            { uploadType: "local" }
        );
    });

    it("should use custom response formatter function", () => {
        intercept(UPLOAD_URL);

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")

            cy.storyLog().assertLogEntryContains(2, {
               uploadResponse: {
                   data: "200 - Yay!"
               }
            });
        });
    });
});
