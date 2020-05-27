import uploadFile from "../uploadFile";

describe("UMD Core - Bundle", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploader", "umd-core");
    });

    it("should use upload with uploader", () => {
        cy.server();

        cy.route({
            method: "POST",
            url: "http://localhost:4000/upload",
            response: { success: true }
        }).as("uploadReq");

        cy.iframe("#storybook-preview-iframe").as("iframe");

        uploadFile(fileName, () => {
            cy.wait(1000);

            cy.storyLog().assertLogPattern(/BATCH_ADD/, { times: 1 });
            cy.storyLog().assertLogPattern(/ITEM_START/, { times: 1 });

            cy.wait("@uploadReq")
				.then((req) => {
					expect(req.request.body.name).to.eq(fileName);
				});
                // .its("request.body")
                // .should((body) => {
                //     expect(body.get("file").name).to.eq(fileName);
                // })
        }, "#upload-button");
    });
});
