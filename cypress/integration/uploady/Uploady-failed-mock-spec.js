import uploadFile from "../uploadFile";
import { ITEM_ERROR, ITEM_START, WAIT_MEDIUM } from "../../constants";

describe("Uploady - Failed Mock Send", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploady",
            "with-failing-mock-sender",
        );
    });

    it("failed mock send should trigger item error", () => {
        uploadFile(fileName, () => {
            cy.storyLog().assertLogPattern(ITEM_START);
            cy.wait(WAIT_MEDIUM);

            cy.storyLog().assertLogPattern(ITEM_ERROR)
                .then((matches) => {
                    const logIndex = matches[0].index;
                    cy.storyLog().assertLogEntryContains(logIndex, { state: "error" });
                });
        });
    });
});
