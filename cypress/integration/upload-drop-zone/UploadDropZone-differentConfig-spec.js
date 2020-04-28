import dropFile from "../dropFile";

describe("UploadDropZone - Different Config", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadDropZone", "different-configuration");
    });

    it("should allow overriding upload options from dropzone", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        //test button with autoUpload = false
        dropFile(fileName, () => {
            cy.wait(100);
            cy.storyLog().assertLogEntryCount(1);
        }, "#upload-dz-a");

        //test other button with custom destination header
        dropFile(fileName, () => {
            cy.wait(100);

            cy.storyLog().assertLogEntryContains(1, {
                destination: {
                    headers: {
                        "x-test": "1234"
                    }
                }
            });
        }, "#upload-dz-b");
    });
});
