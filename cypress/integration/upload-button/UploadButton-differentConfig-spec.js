import uploadFile from "../uploadFile";
import { WAIT_X_SHORT } from "../../constants";

describe("UploadButton - Different Configuration", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "different-configuration");
    });

    it("should allow overriding upload options from button", () => {
        //test button with autoUpload = false
        uploadFile(fileName, () => {
            cy.wait(WAIT_X_SHORT);
            cy.storyLog().assertLogEntryCount(1);
        }, "#upload-a");

        //test other button with custom destination header
        uploadFile(fileName, () => {
            cy.wait(WAIT_X_SHORT);

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
