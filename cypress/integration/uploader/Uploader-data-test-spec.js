import uploadFile from "../uploadFile";
import { WAIT_X_SHORT } from "../../constants";

describe("Uploader - Event data test", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory("uploader", "test-events-data&knob-mock send delay_Upload Destination=100");
    });

    it("should upload and trigger events with non-proxy data", () => {
        uploadFile(fileName, () =>{
            cy.wait(WAIT_X_SHORT);
            cy.storyLog().assertFileItemStartFinish(fileName, 2);

            cy.storyLog().customAssertLogEntry("###BATCH-ADD", (logLine) => {
                expect(Object.getOwnPropertySymbols(logLine[0])).to.have.lengthOf(0, "BATCH-ADD batch - shouldnt have proxy symbols");
                expect(Object.getOwnPropertySymbols(logLine[0])).to.have.lengthOf(0, "BATCH-ADD options - shouldnt have proxy symbols");
            });

            cy.storyLog().customAssertLogEntry("###REQUEST_PRE_SEND", (logLine, env) => {
                expect(Object.getOwnPropertySymbols(logLine[0])).to.have.lengthOf(0, "REQUEST_PRE_SEND items - shouldnt have proxy symbols");
                expect(Object.getOwnPropertySymbols(logLine[0][0])).to.have.lengthOf(1, "REQUEST_PRE_SEND items[0] - shouldnt have proxy symbols");
                expect(Object.getOwnPropertySymbols(logLine[1])).to.have.lengthOf(0, "REQUEST_PRE_SEND options - shouldnt have proxy symbols");

                if (env !== "production") {
                    //can only test in dev because in prod, proxy isnt used anyway so change wont be blocked
                    expect(logLine[0][0]._test).to.be.undefined;
                    expect(logLine[1]._test).to.be.undefined;
                }
            });

            cy.storyLog().customAssertLogEntry("###FILE-PROGRESS", (logLine) => {
                expect(Object.getOwnPropertySymbols(logLine[0])).to.have.lengthOf(1, "FILE-PROGRESS item - shouldnt have proxy symbols");
            });

            cy.storyLog().customAssertLogEntry("###FILE-FINISH", (logLine, env) => {
                expect(Object.getOwnPropertySymbols(logLine[0])).to.have.lengthOf(1, "FILE-FINISH item - shouldnt have proxy symbols");

                if (env !== "production") {
                    //can only test in dev because in prod, proxy isnt used anyway so change wont be blocked
                    expect(logLine[0]._test).to.be.undefined;
                }
            });

            cy.storyLog().customAssertLogEntry("###BATCH-FINISH", (logLine) => {
                expect(Object.getOwnPropertySymbols(logLine[0])).to.have.lengthOf(0, "BATCH-FINISH batch - shouldnt have proxy symbols");
                expect(Object.getOwnPropertySymbols(logLine[0].items[0])).to.have.lengthOf(1, "BATCH-FINISH batch item - shouldnt have proxy symbols");
            });
        }, "#upload-button");
    });
});
