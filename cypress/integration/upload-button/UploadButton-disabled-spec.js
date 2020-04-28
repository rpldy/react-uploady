import uploadFile from "../uploadFile";

describe("Disabled During Upload", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "disabled-during-upload");
    });

    it("should disable upload button during upload", () => {

        cy.iframe("#storybook-preview-iframe").as("iframe");

        cy.get("@iframe")
            .find("input")
            .should("exist")
            .as("fInput");

        uploadFile(fileName, () => {
            cy.wait(100);
            cy.get("@uploadButton").should("be.disabled");

            cy.wait(2000);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
            cy.get("@uploadButton").should("not.be.disabled");
        });
    });
});
