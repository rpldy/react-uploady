import { uploadFileTimes } from "../uploadFile";
import {
    BATCH_ADD,
    BATCH_FINALIZE,
    ITEM_FINISH,
    ITEM_START,
    WAIT_MEDIUM,
    WAIT_SHORT
} from "../../constants";

describe("Uploady - cancel from BATCH_ADD", () => {
    const fileName = "flower.jpg";

    const loadPage = () =>
        cy.visitStory("uploady", "test-cancel-on-batch-add&knob-mock send delay_Upload Destination=100");

    it("clean up batch after cancle from BATCH_ADD", () => {
        loadPage();

        uploadFileTimes(fileName, () => {
            cy.wait(WAIT_SHORT);

            cy.storyLog().assertLogPattern(BATCH_ADD, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_START, { times: 0 });

            uploadFileTimes(fileName, () => {
                cy.wait(WAIT_MEDIUM);

                cy.storyLog().assertLogPattern(BATCH_ADD, { times: 2 });
                cy.storyLog().assertLogPattern(BATCH_FINALIZE, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });
            }, 2, "#upload-button");
        }, 3, "#upload-button");
    });
});
