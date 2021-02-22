import uploadFile from "../uploadFile";

describe("Uploady - With Abort", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "with-abort");
    });

    it("should abort running upload", () => {
        const abortSelector = "button[data-test='abort-batch-0']";

        cy.get(abortSelector)
            .should("not.exist");

        uploadFile(fileName, () => {
            cy.get(abortSelector)
                .should("be.visible")
                .click();

            cy.wait(500);

            cy.storyLog().assertLogPattern(/ITEM_ABORT/);
            cy.storyLog().assertLogPattern(/BATCH_ABORT/);
            cy.storyLog().assertLogPattern(/ITEM_FINISH/, { times: 0 });
        }, "#upload-button");
    });
});
