import { UPLOAD_URL } from "../../constants";
import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("Uploady - Undefined params", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory(
            "uploady",
            "with-header-from-file-name",
            { uploadType: "local" }
        );
    });

    const testUndefinedNotPassed = () => {
        cy.waitExtraShort();

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
        intercept(UPLOAD_URL);

        cy.setUploadOptions({ params: { empty: undefined } });

        testUndefinedNotPassed();
    });

    it("should not pass undefined param to formData from requestPreSend", () => {
        intercept(UPLOAD_URL);

        cy.setPreSendOptions({ params: { empty: undefined } });

        testUndefinedNotPassed();
    });

    it("should pass undefined param with formDataAllowUndefined", () => {
        intercept(UPLOAD_URL);

        cy.setUploadOptions({
            formDataAllowUndefined: true,
        });

        cy.setPreSendOptions({ params: { empty: undefined } });

        cy.waitExtraShort();

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
