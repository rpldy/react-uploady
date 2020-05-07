import { uploadFileTimes } from "../uploadFile";

describe("UploadPreview - Simple - Multiple files", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "simple&knob-destination_Upload Destination=local&knob-group files in single request_Upload Settings=true&knob-max in group_Upload Settings=2");
    });

    it("should show upload preview for multiple files", () => {
        //need to wait for storybook to re-render due to knobs passed in URL
        cy.wait(2000);

        cy.server();

        cy.route({
            method: "POST",
            url: "http://localhost:4000/upload",
            response: { success: true }
        }).as("uploadReq");

        cy.iframe("#storybook-preview-iframe").as("iframe");

        uploadFileTimes(fileName, () => {
            cy.wait("@uploadReq")
                .its("request.body")
                .should((body) => {
                    expect(body.get("file[0]").name).to.eq(fileName);
                    expect(body.get("file[1]").name).to.eq("flower2.jpg");
                });

            cy.wait("@uploadReq")
                .its("request.body")
                .should((body) => {
                    expect(body.get("file").name).to.eq("flower3.jpg");
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

