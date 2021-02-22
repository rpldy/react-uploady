import uploadFile from "../uploadFile";

describe("With Progress", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-progress");
    });

    it("should show upload progress", () => {
        uploadFile(fileName, () => {
            cy.wait(1500);
            cy.storyLog().assertLogPattern(/progress event uploaded: \d+, completed: \d+$/, {
                times: 6,
                different: true
            });
        });
    });
});
