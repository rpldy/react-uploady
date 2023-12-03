import uploadFile, { uploadFileTimes } from "../uploadFile";
import {
    BATCH_ADD,
    BATCH_FINALIZE,
    BATCH_PROGRESS,
    ITEM_FINISH,
    ITEM_PROGRESS,
    ITEM_START,
} from "../../constants";

//Tests in this spec rely on mock sender config progress intervals to be at 10% increments
describe("MockSender - Progress", () => {
    const fileName = "flower.jpg";
    const fileName2 = "sea.jpg";

    const loadStory = () =>
        cy.visitStory(
            "mockSender",
            "with-mock-progress",
        );

    it("should provide the progress based on configuration", () => {
        loadStory();

        uploadFile(fileName, () => {
            cy.waitMedium();

            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });

            cy.storyLog().customAssertLogEntry(BATCH_PROGRESS, (logLines) => {
                const batchProgress = logLines.map(({ args }) => args[0].completed);

                cy.storyLog().customAssertLogEntry(ITEM_PROGRESS, (logLines) => {
                    const itemProgress = logLines.map(({ args }) => args[0].completed);

                    batchProgress.forEach((p, index) => {
                        if (p < 100) {
                            expect(p, `expect batch progress (index: ${index}) ${p} to match item progress ${itemProgress[index]}
                            items: ${itemProgress.join(",")}`)
                                .to.equal(itemProgress[index] / 100);
                        }
                    });

                });
            });
        }, "#upload-button");
    });

    it("should provide progress for multiple items", () => {
        loadStory();

        uploadFileTimes(fileName, () => {
            cy.waitLong();

            cy.storyLog().assertLogPattern(BATCH_ADD, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
            cy.storyLog().assertLogPattern(BATCH_FINALIZE, { times: 1 });

            cy.storyLog().customAssertLogEntry(BATCH_PROGRESS, (logLines) => {
                const batchProgress = logLines.map(({ args }) => args[0].completed);

                cy.storyLog().customAssertLogEntry(ITEM_PROGRESS, (logLines) => {
                    const itemProgress = logLines.map(({ args }) => args[0].completed);

                    let prev = 0;
                    batchProgress.forEach((completed, index) => {
                        const current = completed === 100 ? 1 : completed;

                        if (itemProgress[index] !== 100) {
                            expect(current - prev, `expect current completed ${current} to be 0.05 higher than prev: ${prev}`)
                                .to.be.closeTo(0.05, 0.001);
                        } else {
                            //on 10% intervals, the 10th event also begins the new item so jump is by 0.10 instead of 0.05
                            expect(current - prev, `expect current (index = ${index}) completed ${current} to be 0.1 higher than prev: ${prev}
                            items: ${itemProgress.join(",")}`)
                                .to.be.closeTo(0.1, 0.001);
                        }

                        prev = current;
                    });
                });
            });

        }, 2, "#upload-button");
    });
});
