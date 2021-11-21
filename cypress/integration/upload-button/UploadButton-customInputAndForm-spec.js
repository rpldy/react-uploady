import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("UploadButton - With Custom File Input And Form", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-custom-file-input-and-form");
    });

    it("should use form attributes ", () => {
        intercept("http://react-uploady-dummy-server.comm");

        uploadFile(fileName, () => {
            cy.wait("@uploadReq").then((xhr) => {
                expect(xhr.response.body.success).to.eq(true);
            });
        });
    });
});
