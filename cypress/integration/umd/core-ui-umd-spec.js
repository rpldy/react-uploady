import uploadFile from "../uploadFile";

describe("UMD UI CORE - Bundle", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "umd-core-ui", true);
    });

    it("should use uploady and upload file", () => {
        cy.server();

        cy.route({
            method: "POST",
            url: "http://localhost:4000/upload",
            response: { success: true }
        }).as("uploadReq");

        uploadFile(fileName, () => {
            cy.wait(1500);

            cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 1 });
            cy.storyLog().assertLogPattern(/ITEM_START/, { times: 1 });

			cy.wait("@uploadReq").its("status").should("eq", 200);

			cy.get("@uploadReq")
				.then((req) => {
					expect(req.request.body.get("file").name).to.eq(fileName);
				});
        }, "#upload-button", null);
    });
});
