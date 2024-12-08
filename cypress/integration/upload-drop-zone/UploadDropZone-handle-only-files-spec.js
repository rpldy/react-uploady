import { ITEM_START } from "../../constants";
import dropFile from "../dropFile";

describe("UploadDropZone - shouldHandleDrag for files only", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploadDropZone",
            "with-full-screen",
            { mockDelay: 100 }
        );
    });

    it("should not show drag overlay if not all files", () => {
        cy.get("#upload-drop-zone")
            .should("be.visible")
            .trigger("dragenter", { dataTransfer: { items: [ { kind: "dummy" } ] } });

        cy.get(".dropIndicator")
            .should("not.be.visible");

        cy.get("#upload-drop-zone")
            .trigger("dragenter", { dataTransfer: { items: [ { kind: "file" } ] } });

        cy.get(".dropIndicator")
            .should("be.visible");

        cy.get("#upload-drop-zone")
            .trigger("dragleave", {});

        dropFile(fileName, () => {
            cy.waitExtraShort();
            cy.storyLog().assertLogPattern(ITEM_START);
        });
    });
});
