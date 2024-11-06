import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("Uploady - filesParamName", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploady",
            "with-custom-field-name",
            { useMock: false }
        );
    });

    it("should set the files param name to custom value", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.get("#upload-button")
                .click();

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["customFieldName"]).to.equal(fileName);
                    cy.waitShort();
                    cy.storyLog().assertFileItemStartFinish(fileName, 1);
                });
        });
    });
});
