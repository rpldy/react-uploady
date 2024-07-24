import { UPLOAD_URL } from "../../constants";
import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("Uploady - Header from RequestPreSend hook", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory("uploady", "with-header-from-file-name&knob-destination_Upload Destination=local&knob-mock send delay_Upload Destination=1000&knob-multiple files_Upload Settings=true&knob-group files in single request_Upload Settings=&knob-max in group_Upload Settings=2&knob-auto upload on add_Upload Settings=true");
    });

    it("should create a header from pre send hook using file name", () => {
        intercept(UPLOAD_URL);

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")
                .then((xhr) => {
                    cy.storyLog().assertLogEntryContains(2, {
                        uploadResponse: {
                            data: { success: true }
                        }
                    });

                    expect(xhr.request.headers["x-file-names-lengths"]).to.equal("10");
                });
        });
    });
});
