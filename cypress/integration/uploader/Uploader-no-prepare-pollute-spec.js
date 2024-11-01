import { uploadFileTimes } from "../uploadFile";
import { ITEM_FINISH, ITEM_START, UPLOAD_URL } from "../../constants";
import intercept from "../intercept";

describe("Uploader - PreSend Tests", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "uploader",
            "test-events-data",
            { useMock: false, uploadUrl: UPLOAD_URL }
        );
    });

    it("should not pollute options for items when using preSend Prepare", () => {
        intercept(UPLOAD_URL + "*");

        cy.setUploadOptions({
           preSendCallback: (items, options) => {
               //ensure the options are not polluted between calls to preSend
               cy.expect(options.destination.url).to.eq(UPLOAD_URL);

               if (items[0].file.name === "a.jpg") {
                   return {
                       options: {
                           destination: {
                               url: UPLOAD_URL + "?test=a",
                               headers: { "x-test": "aaa" }
                           }
                       }
                   };
               } else {
                   return {
                       options: {
                           destination: {
                               url: UPLOAD_URL + "?test=b",
                               headers: { "x-test": "bbb" }
                           }
                       }
                   };
               }
           },
        });

        uploadFileTimes(fileName, () => {
            cy.waitExtraShort();

            cy.storyLog().assertLogPattern(ITEM_START, { times: 2 });
            cy.storyLog().assertLogPattern(ITEM_FINISH, { times: 2 });

            cy.wait("@uploadReq")
                .then(({ request }) => {
                    cy.expect(request.headers).to.include({ "x-test": "aaa" });
                })
                .its("request.url")
                .should("include", "?test=a")


            cy.wait("@uploadReq")
                .then(({ request }) => {
                    cy.expect(request.headers).to.include({ "x-test": "bbb" });
                    cy.expect(request.headers).to.not.include({ "x-test": "aaa" });
                })
                .its("request.url")
                .should("include", "?test=b");

        }, 2, "#upload-button", { fileName: "a.jpg" });
    });
});
