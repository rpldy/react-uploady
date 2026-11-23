import { BATCH_ADD } from "../../constants";

describe("UploadButton - Simple", () => {

    before(() => {
        cy.visitStory(
            "uploadUrlInput",
            "simple",
            { mockDelay: 100 }
        );
    });

    it("should use uploady", () => {
        cy.get("input#url-input")
            .should("exist")
            .type("http://test.com{enter}");

        cy.storyLog().assertUrlItemStartFinish("http://test.com", 1);
        cy.storyLog().assertLogPattern(BATCH_ADD);
    });
});
