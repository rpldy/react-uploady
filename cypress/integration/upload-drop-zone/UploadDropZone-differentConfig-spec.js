import dropFile from "../dropFile";

describe("UploadDropZone - Different Config", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadDropZone", "different-configuration");
    });

    it("should allow overriding upload options from dropzone", () => {
        //test button with autoUpload = false
        dropFile(fileName, () => {
            cy.waitExtraShort();
            cy.storyLog().assertLogEntryCount(1);
        }, "#upload-dz-a");

        //test other button with custom destination header
        dropFile(fileName, () => {
            cy.waitExtraShort();

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
