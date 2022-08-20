import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { getUploadyVersion } from "../../../scripts/utils";

describe("Uploady - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploady",
            "with-context-api-button&knob-multiple files_Upload Settings=true&knob-group files in single request_Upload Settings=&knob-max in group_Upload Settings=2&knob-auto upload on add_Upload Settings=true",
            { useMock : false }
        );
    });

    it("should expose version from uploady package", () => {
        cy.get("#uploady-version")
            .invoke("text")
            .should("eq", getUploadyVersion());
    });

    it("should use custom button with context", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")

            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            cy.storyLog().assertLogEntryContains(2, {
                uploadResponse: {
                    data: { success: true }
                }
            });
        });
    });
});
