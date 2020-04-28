import uploadFile from "../uploadFile";

describe("With Progress", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-progress");
    });

    it("should show upload progress", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        // cy.get("@iframe")
        //     .find("button")
        //     .click()
        //
        // cy.fixture(fileName, "base64").then((fileContent) => {
        //     cy.get("@iframe")
        //         .find("input").upload(
        //         { fileContent, fileName, mimeType: "image/jpeg" },
        //         { subjectType: "input" });
        uploadFile(fileName, () => {
            cy.wait(2000);

            cy.storyLog().assertLogPattern(/progress event uploaded: \d+, completed: \d+$/, {
                times: 5,
                different: true
            });
        });
    });
});
