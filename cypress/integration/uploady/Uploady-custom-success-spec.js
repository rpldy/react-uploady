import { interceptWithHandler } from "../intercept";
import uploadFile from "../uploadFile";
import { WAIT_SHORT } from "../../constants";

describe("Uploady - Custom Success", () => {
    const fileName = "flower.jpg";

    const loadPage = () =>
        cy.visitStory(
            "uploady",
            "with-context-api-button",
            { useMock : false }
        );

    it("should use custom button with sync custom success callback", () => {
        loadPage();

        interceptWithHandler((req) => {
            req.reply(308, { success: true });
        });

        cy.setUploadOptions({ isSuccessfulCall: (xhr) => xhr.status === 308 });

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")

            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            cy.storyLog().assertLogEntryContains(2, {
                uploadResponse: {
                    data: { success: true }
                }
            });
        });
    });

    it("should use custom button with async custom success callback", () => {
        loadPage();

        interceptWithHandler((req) => {
            req.reply(308, { success: true });
        });

        cy.setUploadOptions({ isSuccessfulCall: async (xhr) => xhr.status === 308 });

        uploadFile(fileName, () => {
            cy.wait("@uploadReq")

            cy.wait(WAIT_SHORT);

            cy.storyLog().assertFileItemStartFinish(fileName, 1);

            cy.storyLog().assertLogEntryContains(2, {
                uploadResponse: {
                    data: { success: true }
                }
            });
        });
    });
});
