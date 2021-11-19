import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("Uploady - filesParamName", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "with-custom-field-name&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url");
    });

    it("should set the files param name to custom value", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.get("#upload-button")
                .click();

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["customFieldName"]).to.equal(fileName);

                    cy.storyLog().assertFileItemStartFinish(fileName, 1);
                });
        });
    });
});
