import uploadFile from "../uploadFile";

describe("Uploader - Event data test", () => {
    const fileName = "flower.jpg";

    const loadStory = () =>
        cy.visitStory("uploader", "test-events-data&knob-mock send delay_Upload Destination=100");

    it("should upload and trigger events with non-proxy data", () => {
        loadStory();

        uploadFile(fileName, () =>{
            cy.waitExtraShort();
            cy.storyLog().assertFileItemStartFinish(fileName, 2);

            cy.storyLog().customAssertLogEntry("###BATCH-ADD", (logLine) => {
                expect(Object.getOwnPropertySymbols(logLine[0])).to.have.lengthOf(0, "BATCH-ADD batch - shouldnt have proxy symbols");
                expect(Object.getOwnPropertySymbols(logLine[1])).to.have.lengthOf(0, "BATCH-ADD options - shouldnt have proxy symbols");
                expect(logLine[1].userData.test).to.eq("!23", "BATCH-ADD options to contain user data passed from uploader.add");
            });

            cy.storyLog().customAssertLogEntry("###REQUEST_PRE_SEND", (logLine, env) => {
                expect(Object.getOwnPropertySymbols(logLine[0])).to.have.lengthOf(0, "REQUEST_PRE_SEND items - shouldnt have proxy symbols");
                expect(Object.getOwnPropertySymbols(logLine[0][0])).to.have.lengthOf(1, "REQUEST_PRE_SEND items[0] - shouldnt have proxy symbols");
                expect(Object.getOwnPropertySymbols(logLine[1])).to.have.lengthOf(0, "REQUEST_PRE_SEND options - shouldnt have proxy symbols");
                expect(logLine[1].userData.test).to.eq("!23", "REQUEST_PRE_SEND options to contain user data passed from uploader.add");

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
                expect(logLine[1].userData.test).to.eq("!23", "FILE-FINISH options to contain user data passed from uploader.add");

                if (env !== "production") {
                    //can only test in dev because in prod, proxy isnt used anyway so change wont be blocked
                    expect(logLine[0]._test).to.be.undefined;
                }
            });

            cy.waitMedium();

            cy.storyLog().customAssertLogEntry("###BATCH-FINISH", (logLine, env) => {
                expect(Object.getOwnPropertySymbols(logLine[0])).to.have.lengthOf(0, "BATCH-FINISH batch - shouldnt have proxy symbols");
                expect(logLine[1].userData.test).to.eq("!23", "BATCH-FINISH options to contain user data passed from uploader.add");

                if (env === "production") {
                    expect(Object.getOwnPropertySymbols(logLine[0].items[0])).to.have.lengthOf(1, "BATCH-FINISH batch item - shouldnt have proxy symbols");
                }
            });
        }, "#upload-button");
    });
});
