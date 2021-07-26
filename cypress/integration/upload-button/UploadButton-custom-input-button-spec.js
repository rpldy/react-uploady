import intercept from "../intercept";
import uploadFile from "../uploadFile";
import { ITEM_FINISH } from "../storyLogPatterns";

describe("With Custom File Input And Button", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploadButton", "with-custom-file-input-and-custom-button&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url");
    });

    it("should change file input attribute", () => {
        intercept();

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
