import uploadFile from "../uploadFile";
import { BATCH_FINALIZE, ITEM_START, ITEM_ERROR } from "../../constants";

describe("Uploader - recover from sender error test", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploader",
            "with-custom-ui",
            { uploadUrl: "http://localhost:8439/not-exist" }
        );
    });

    it("should upload again after unexpected sender error", () => {
        uploadFile(fileName, () => {
            uploadFile(fileName, () => {
                cy.storyLog().assertLogPattern(BATCH_FINALIZE, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
                cy.storyLog().assertLogPattern(ITEM_ERROR, { times: 2 });
            }, "#upload-button");
        }, "#upload-button");
    });
});
