import intercept from "../intercept";
import { uploadFileTimes } from "../uploadFile";

describe("UploadButton - Simple - Multiple files", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "simple&knob-destination_Upload Destination=local&knob-group files in single request_Upload Settings=true&knob-max in group_Upload Settings=2");
    });

    it("should show upload preview for multiple files", () => {
        intercept("http://localhost:4000/upload");

        uploadFileTimes(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["file[0]"]).to.eq(fileName);
                    expect(formData["file[1]"]).to.eq("flower2.jpg");
                });

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["file"]).to.eq("flower3.jpg");
                });

            cy.wait(1000);

            cy.storyLog().assertLogPattern(/ITEM_START/, { index: 1 });
            cy.storyLog().assertLogPattern(/ITEM_START/, { index: 2 });
            cy.storyLog().assertLogPattern(/ITEM_START/, { index: 5 });

            cy.storyLog().assertLogPattern(/ITEM_FINISH/, { index: 3 });
            cy.storyLog().assertLogPattern(/ITEM_FINISH/, { index: 4 });
            cy.storyLog().assertLogPattern(/ITEM_FINISH/, { index: 6 });
        }, 3);
    });
});

