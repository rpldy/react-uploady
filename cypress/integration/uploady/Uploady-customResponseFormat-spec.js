import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("Uploady - Custom Response Formatter", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "with-custom-response-format&knob-destination_Upload Destination=local&knob-mock send delay_Upload Destination=1000&knob-multiple files_Upload Settings=true&knob-group files in single request_Upload Settings=&knob-max in group_Upload Settings=2&knob-auto upload on add_Upload Settings=true");
    });

    it("should use custom response formatter function", () => {
        intercept("http://localhost:4000/upload");

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")

            cy.storyLog().assertLogEntryContains(2, {
               uploadResponse: {
                   data: "200 - Yay!"
               }
            });
        });
    });
});
