import { uploadFileTimes } from "../uploadFile";
import {
    BATCH_ADD,
    BATCH_FINALIZE,
    ITEM_FINISH,
    ITEM_START,
} from "../../constants";

describe("Uploady - cancel from BATCH_ADD", () => {
    const fileName = "flower.jpg";

    const loadPage = () =>
        cy.visitStory(
            "uploady",
            "test-cancel-on-batch-add",
            { mockDelay: 100 }
        );

    it("clean up batch after cancle from BATCH_ADD", () => {
        loadPage();

        uploadFileTimes(fileName, () => {
            cy.waitShort();

            cy.storyLog().assertLogPattern(BATCH_ADD, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

            uploadFileTimes(fileName, () => {
                cy.waitMedium();

                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 2 });
                cy.storyLog().assertLogPattern(BATCH_FINALIZE, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
            }, 2, "#upload-button");
        }, 3, "#upload-button");
    });
});
