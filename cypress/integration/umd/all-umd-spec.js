import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { BATCH_ADD, ITEM_START } from "../../constants";

describe("UMD ALL - Bundle", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory("uploady", "umd-all", { useMock: false });
    });

    it("should use Uploady and UploadButton to upload file", () => {
        intercept();

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["file"]).to.eq(fileName);
                })
                .its("response.statusCode")
                .should("eq", 200);

            cy.storyLog().assertLogPattern(BATCH_ADD, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });

            cy.get("img[data-test='upload-preview']")
                .should("be.visible")
                .invoke("attr", "src")
                .should("match", /blob:/);
        }, "#upload-button");
    });
});
