import dropFile from "../dropFile";

describe("UploadDropZone - Simple", () => {
    const fileName = "flower.jpg";

    const loadStory = () =>
        cy.visitStory(
            "uploadDropZone",
            "with-third-party-drop-zone",
            { mockDelay: 100 }
        );

    it("should upload dropped file using 3rd party dnd library", () => {
        loadStory();

        dropFile(fileName, () => {
            cy.waitExtraShort();
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });

    it("should upload drop file with user data passed to upload ", () => {
        const test = "!23";

        loadStory();
        cy.setUploadOptions({ userData: { test } });

        dropFile(fileName, () => {
            cy.waitExtraShort();
            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            const assertEventData = (event) =>
                cy.get(`#user-data-results li[data-id='${event}']`)
                    .should("have.text", `${event}: ${test}`);

            assertEventData("itemStart");
            assertEventData("itemFinish");
            assertEventData("batchAdd");
            assertEventData("batchStart");
            assertEventData("batchProgress");
            assertEventData("batchFinish");
        });
    });
});
