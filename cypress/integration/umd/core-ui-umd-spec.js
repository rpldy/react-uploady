import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { ITEM_START, BATCH_ADD } from "../../constants";

describe("UMD UI CORE - Bundle", () => {
    const fileName = "flower.jpg";

    beforeEach(() => {
        cy.visitStory("uploady", "umd-core-ui", { useMock: false });
    });

    it("should use uploady and upload file", () => {
        intercept()

        uploadFile(fileName, () => {
			cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["file"]).to.eq(fileName);
                })
                .its("response.statusCode")
                .should("eq", 200);

            cy.storyLog().assertLogPattern(BATCH_ADD, { times: 1 });
            cy.storyLog().assertLogPattern(ITEM_START, { times: 1 });
        }, "#upload-button");
    });
});
