import uploadFile from "../uploadFile";

describe("UMD UI CORE - Bundle", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "umd-core-ui");
    });

    it("should use uploady and upload file", () => {
        cy.intercept("POST", "http://localhost:4000/upload", {
            statusCode: 200,
            body: { success: true }
        }).as("uploadReq");

        uploadFile(fileName, () => {
			cy.wait("@uploadReq").its("status")
                .should("eq", 200);

            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData("file")).to.eq(fileName);
                });

            cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 1 });
            cy.storyLog().assertLogPattern(/ITEM_START/, { times: 1 });
        }, "#upload-button");
    });
});
