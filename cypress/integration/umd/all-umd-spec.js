import uploadFile from "../uploadFile";

describe("UMD ALL - Bundle", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "umd-all");
    });

    it("should use Uploady and UploadButton to upload file", () => {
        cy.intercept("POST", "http://localhost:4000/upload", {
            statusCode: 200,
            body: { success: true }
        }).as("uploadReq");

        uploadFile(fileName, () => {
            cy.wait(1000);

            cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 1 });
            cy.storyLog().assertLogPattern(/ITEM_START/, { times: 1 });

			cy.wait("@uploadReq")
				.its("status")
				.should("eq", 200);

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData("file")).to.eq(fileName);
                });

            cy.get("img[data-test='upload-preview']")
                .should("be.visible")
                .invoke("attr", "src")
                .should("match", /blob:/);
        }, "#upload-button");
    });
});
