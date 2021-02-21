import { uploadFileTimes } from "../uploadFile";

describe("UploadPreview - Simple - Multiple files", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "simple&knob-destination_Upload Destination=local&knob-group files in single request_Upload Settings=true&knob-max in group_Upload Settings=2");
    });

    it("should show upload preview for multiple files", () => {
        cy.intercept("POST", "http://localhost:4000/upload", {
            statusCode: 200,
            body: { success: true }
        }).as("uploadReq");

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

            cy.storyLog().assertLogPattern(/ITEM_START/, { index: 1 });
            cy.storyLog().assertLogPattern(/ITEM_START/, { index: 2 });
            cy.storyLog().assertLogPattern(/ITEM_START/, { index: 5 });

            cy.storyLog().assertLogPattern(/ITEM_FINISH/, { index: 3 });
            cy.storyLog().assertLogPattern(/ITEM_FINISH/, { index: 4 });
            cy.storyLog().assertLogPattern(/ITEM_FINISH/, { index: 6 });
        }, 3);
    });
});

