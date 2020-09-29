import uploadFile from "../uploadFile";


describe("Uploady - Form", () => {
    const fileName = "flower.jpg",
        fileName2 = "sea.jpg";

    before(() => {
        cy.visitStory("uploady", "with-form&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url", true);
    });

    it("should submit form with upload and other fields", () => {

        cy.server();

        cy.route({
            method: "POST",
            url: "http://test.upload/url",
            response: { success: true }
        }).as("uploadReq");

        cy.get("#field-name")
            .type("james");

        cy.get("#field-age")
            .type("22");

        uploadFile(fileName, () => {
            uploadFile(fileName2, () => {

                cy.get("#form-submit")
                    .click();

                cy.wait("@uploadReq")
                    .then((xhr) => {
                        expect(xhr.request.body.get("field-name")).to.eq("james");
                        expect(xhr.request.body.get("field-age")).to.eq("22");
                        expect(xhr.request.body.get("file").name).to.eq(fileName2);

                        cy.storyLog().assertLogPattern(/ITEM_FINISH/, { times: 1 });
                    });
            }, "#form-upload-button", null);
        }, "#form-upload-button", null);
    });
});
