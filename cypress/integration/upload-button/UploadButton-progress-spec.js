import uploadFile from "../uploadFile";

describe("With Progress", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-progress");
    });

    it("should show upload progress", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        uploadFile(fileName, () => {
            cy.wait(2000);

            cy.storyLog().assertLogPattern(/progress event uploaded: \d+, completed: \d+$/, {
                times: 6,
                different: true
            });
        });
    });
});
