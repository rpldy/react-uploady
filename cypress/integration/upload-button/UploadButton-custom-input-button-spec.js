import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { ITEM_FINISH } from "../../constants";

describe("UploadButton - With Custom File Input And Button", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadButton",
            "with-custom-file-input-and-custom-button",
            { useMock: false }
        );
    });

    it("should change file input attribute", () => {
        intercept();
        cy.waitMedium();

        cy.get("#select-input-type")
            .select("dir");

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")
                .interceptFormData((formData) => {
                    expect(formData["testFile"]).to.eq(fileName);

                    cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 1 });
                });
        });

        cy.get("input[type='file']")
            .should("have.attr", "webkitdirectory", "true");
    });
});
