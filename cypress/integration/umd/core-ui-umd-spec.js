import uploadFile from "../uploadFile";

describe("UMD UI CORE - Bundle", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploady", "umd-core-ui", false);
    });

    it("should use uploady and upload file", () => {
        cy.wait(2000);

        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.server();

        cy.route({
            method: "POST",
            url: "http://localhost:4000/upload",
            response: { success: true }
        }).as("uploadReq");

        // cy.get("@iframe")
        //     .find("input")
        //     .as("fInput");

        uploadFile(fileName, () => {
            cy.wait(1500);

            cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 1 });
            cy.storyLog().assertLogPattern(/ITEM_START/, { times: 1 });

			cy.wait("@uploadReq").its("status").should("eq", 200);

			cy.get("@uploadReq")
				.then((req) => {
					expect(req.request.body.get("file").name).to.eq(fileName);
				});
        }, "#upload-button");
    });
});
