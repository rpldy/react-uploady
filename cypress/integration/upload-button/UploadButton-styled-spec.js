import uploadFile from "../uploadFile";

describe("With Styled Component", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-styled-component&knob-mock send delay_Upload Destination=100");
    });

    it("should be styled with styled-components", () => {
        uploadFile(fileName, () => {
            cy.get("@uploadButton")
                .should("have.css", "background-color", "rgb(1, 9, 22)")
                .should("have.css", "color", "rgb(176, 177, 179)")

            cy.wait(200);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
