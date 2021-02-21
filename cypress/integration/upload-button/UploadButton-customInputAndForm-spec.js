import uploadFile from "../uploadFile";

describe("With Custom File Input And Form", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-custom-file-input-and-form");
    });

    it("should use form attributes ", () => {
        cy.intercept("POST", "http://react-uploady-dummy-server.comm", {
            statusCode: 200,
            body: { success: true }
        }).as("uploadReq");

        uploadFile(fileName, () => {
            cy.wait("@uploadReq").then((xhr) => {
                expect(xhr.response.body.success).to.eq(true);
            });
        });
    });
});
