import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { WAIT_X_SHORT } from "../specWaitTimes";

describe("Uploady - Undefined params", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "with-header-from-file-name&knob-destination_Upload Destination=local&knob-mock send delay_Upload Destination=1000&knob-multiple files_Upload Settings=true&knob-group files in single request_Upload Settings=&knob-max in group_Upload Settings=2&knob-auto upload on add_Upload Settings=true");
    });

    const testUndefinedNotPassed = () => {
        cy.wait(WAIT_X_SHORT);

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["file"]).to.eq("flower.jpg");
                    expect(formData).not.to.contain.keys("empty");
                });

            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    };

    it("should not pass undefined param to formData from upload options", () => {
        intercept("http://localhost:4000/upload");

        cy.setUploadOptions({ params: { empty: undefined } });

        testUndefinedNotPassed();
    });

    it("should not pass undefined param to formData from requestPreSend", () => {
        intercept("http://localhost:4000/upload");

        cy.setPreSendOptions({ params: { empty: undefined } });

        testUndefinedNotPassed();
    });

    it("should pass undefined param with formDataAllowUndefined", () => {
        intercept("http://localhost:4000/upload");

        cy.setUploadOptions({
            formDataAllowUndefined: true,
        });

        cy.setPreSendOptions({ params: { empty: undefined } });

        cy.wait(WAIT_X_SHORT);

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["file"]).to.eq("flower.jpg");
                    expect(formData).to.contain.keys("empty");
                    expect(formData["empty"]).to.eq("undefined");
                });

            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
