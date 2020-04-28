import uploadFile from "../uploadFile";

describe("With Custom File Input And Form", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-custom-file-input-and-form");
    });

    it("should use form attributes ", () => {
        cy.server();

        cy.route({
            method: "POST",
            url: "http://react-uploady-dummy-server.comm",
            response: { success: true }
        }).as("uploadReq");

        cy.iframe("#storybook-preview-iframe").as("iframe");

        uploadFile(fileName, () => {
            cy.wait("@uploadReq").then((xhr) => {
                assert.isNotNull(xhr.response.body);
            });
        });
    });
});
