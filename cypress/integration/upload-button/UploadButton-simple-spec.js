import uploadFile from "../uploadFile";

describe("UploadButton - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "simple");
    });

    it("should use uploady", () => {
        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.get("@iframe")
            .find("input")
            .should("exist")
            .as("fInput");

        uploadFile(fileName, () => {

            cy.wait(2000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
