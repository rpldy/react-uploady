import uploadFile from "../uploadFile";
import { WAIT_SHORT } from "../../constants";

describe("NativeUploady - Simple", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("nativeUploady", "simple&knob-mock send delay_Upload Destination=100");
    });

    it("should use native uploady", () => {
        uploadFile(fileName, () => {
            cy.wait(WAIT_SHORT);
            cy.storyLog().assertFileItemStartFinish(fileName, 1);
        });
    });
});
