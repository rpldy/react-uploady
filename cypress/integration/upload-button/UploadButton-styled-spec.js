import uploadFile from "../uploadFile";

describe("UploadButton - With Styled Component", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadButton",
            "with-styled-component",
            { mockDelay: 100 }
        );
    });

    it("should be styled with styled-components", () => {
        uploadFile(fileName, () => {
            cy.get("@uploadButton")
                .should("have.css", "background-color", "rgb(1, 9, 22)")
                .should("have.css", "color", "rgb(176, 177, 179)")

            cy.waitShort();
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
