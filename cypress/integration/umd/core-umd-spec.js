import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { ITEM_START, BATCH_ADD } from "../../constants";

describe("UMD Core - Bundle", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory("uploader", "umd-core", { useMock: false });
    });

    it("should use uploady with uploader", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["file"]).to.eq(fileName);
                })
                .its("response.statusCode").should("eq", 200);

            cy.storyLog().assertLogPattern(BATCH_ADD, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
        }, "#upload-button");
    });
});
