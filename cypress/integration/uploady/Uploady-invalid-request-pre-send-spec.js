import { ITEM_ERROR, ITEM_FINISH, ITEM_START, UPLOAD_URL } from "../../constants";
import intercept from "../intercept";
import { uploadFileTimes } from "../uploadFile";

describe("Uploady - invalid requestPreSend", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory(
            "uploady",
            "test-invalid-pre-send",
            { uploadType: "local" }
        );
    });

    it("should fail invalid updated data from pre send - forbidden item props", () => {
        intercept(UPLOAD_URL);

        uploadFileTimes(fileName, () => {
            cy.waitShort();

            cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_ERROR, { times: 1 });
        }, 2, "#upload-button");
    });
});
