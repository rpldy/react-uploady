import uploadFile from "../uploadFile";
import { BATCH_FINALIZE, ITEM_ERROR, ITEM_START } from "../../constants";

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
            cy.storyLog().assertLogPattern(BATCH_FINALIZE, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_START);

            cy.storyLog().assertLogPattern(ITEM_ERROR)
                .then((matches) => {
                    const logIndex = matches[0].index;
                    cy.storyLog().assertLogEntryContains(logIndex, { state: "error" });
                });
        });
    });
});
