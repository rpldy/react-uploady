import uploadFile from "../uploadFile";

describe("Different Configuration", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "different-configuration");
    });

    it("should allow overriding upload options from button", () => {
        //test button with autoUpload = false
        uploadFile(fileName, () => {
            cy.wait(100);
            cy.storyLog().assertLogEntryCount(1);
        }, "#upload-a");

        //test other button with custom destination header
        uploadFile(fileName, () => {
            cy.wait(100);

            cy.storyLog().assertLogEntryContains(1, {
                destination: {
                    url: "http://react-uploady-dummy-server.comm",
                    headers: {
                        "x-test": "1234"
                    }
                }
            });
        }, "#upload-b");
    });
});
