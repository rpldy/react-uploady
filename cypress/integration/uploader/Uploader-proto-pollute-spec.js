describe("Uploader - No Prototype Pollution test", () => {

    before(() => {
        cy.visitStory("uploader", "test-proto-pollute");
    });

    it("creating uploader shouldn't cause prototype pollution", () => {
        cy.get("#test-info")
            .should("exist");

        cy.waitShort();

        cy.window()
            .then((win) => {
                const uploader = win._test_createUploader({
                    autoUpload: false,
                    destination: JSON.parse(`{"__proto__":{"pollutedKey":123}}`)
                });

                expect(uploader).to.exist;
                expect({}.pollutedKey).to.be.undefined;

                expect(uploader.getOptions().destination.pollutedKey).to.be.undefined;

                const uploader2 = win._test_createUploader(JSON.parse(`{"__proto__":{"pollutedKey":123}}`));

                expect(uploader2).to.exist;
                expect({}.pollutedKey).to.be.undefined;

                expect(uploader2.getOptions()).to.exist;
                expect(uploader.getOptions().pollutedKey).to.be.undefined;
            });
    });
});
