import { uploadFileTimes } from "../uploadFile";

describe("UploadButton - With Progress", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadButton",
            "with-progress",
            { mockDelay: 100 }
        );
    });

    it("should show upload progress", () => {
        uploadFileTimes(fileName, () => {
            cy.waitMedium();

            cy.storyLog().assertLogPattern(/progress event uploaded: [\d.]+, completed: \d+ - batch-1.item-\d/, {
                between: [4, 6],
                different: true
            });

            cy.storyLog().assertLogPattern(/Batch Progress - batch-1 : completed = [\d.]+, loaded = [\d.]+/, {
                between: [3, 5],
            });

            cy.storyLog().assertLogPattern(/Batch Progress - batch-1 : completed = 100, loaded = 744890/,{
                times: 1,
            });

            cy.storyLog().assertLogPattern(/Batch Finished - batch-1 : completed = 100, loaded = 744890/,{
                times: 1,
            });
        }, 2);
    });
});
