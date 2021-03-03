import uploadFile from "../uploadFile";

describe("With Progress", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-progress&knob-mock send delay_Upload Destination=100");
    });

    it("should show upload progress", () => {
        uploadFile(fileName, () => {
            cy.wait(400);
            cy.storyLog().assertLogPattern(/progress event uploaded: \d+, completed: \d+$/, {
                times: 6,
                different: true
            });
        });
    });
});
