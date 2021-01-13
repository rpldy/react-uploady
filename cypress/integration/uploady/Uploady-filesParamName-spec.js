import uploadFile from "../uploadFile";

describe("Uploady - filesParamName", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "with-custom-field-name&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url", true);
    });

    it("should set the files param name to custom value", () => {
        cy.server();

        cy.route({
            method: "POST",
            url: "http://test.upload/url",
            response: { success: true }
        }).as("uploadReq");


        uploadFile(fileName, () => {
            cy.get("#upload-button")
                .click();

            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            cy.wait("@uploadReq")
                .its("request.body")
                .should((body) => {
                    expect(body.get("customFieldName").name).to.equal(fileName);
                });
        }, "button", null);
    });
});
