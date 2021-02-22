import intercept from "../intercept";
import uploadFile from "../uploadFile";

describe("UMD Core - Bundle", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploader", "umd-core");
    });

    it("should use upload with uploader", () => {
        intercept("http://localhost:4000/upload");

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["file"]).to.eq(fileName);
                })
                .its("response.statusCode").should("eq", 200);

            cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 1 });
            cy.storyLog().assertLogPattern(/ITEM_START/, { times: 1 });
        }, "#upload-button");
    });
});
