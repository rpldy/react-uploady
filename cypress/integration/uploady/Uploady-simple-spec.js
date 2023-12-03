import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("Uploady - Simple", () => {
    const fileName = "flower.jpg";
    let pkJsonVersion;

    before(async () => {
        const pkgJson = await import("../../../packages/ui/uploady/package.json");
        pkJsonVersion = pkgJson.version;
    });

    const loadPage = () =>
        cy.visitStory(
            "uploady",
            "with-context-api-button&knob-multiple files_Upload Settings=true&knob-group files in single request_Upload Settings=&knob-max in group_Upload Settings=2&knob-auto upload on add_Upload Settings=true",
            { useMock: false }
        );

    it("should use custom button with context", () => {
        loadPage();
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

    it("should expose version from uploady package", () => {
        loadPage();
        cy.get("#uploady-version")
            .invoke("text")
            .should("eq", pkJsonVersion);
    });
});
