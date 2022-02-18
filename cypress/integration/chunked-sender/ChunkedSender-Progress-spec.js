import { interceptWithDelay } from "../intercept";
import uploadFile from "../uploadFile";
import { CHUNK_START, CHUNK_FINISH } from "../storyLogPatterns";
import { WAIT_X_LONG } from "../specWaitTimes";

describe("ChunkedSender - Progress", () => {
    const fileName = "flower.jpg";

    before(() => {
        cy.visitStory(
            "chunkedSender",
            "with-chunked-sender&knob-chunk size (bytes)_Upload Settings=50000",
            { useMock: false }
        );
    });

    it("should use chunked sender with progress events", () => {
        //delay response so we dont miss events due to progress event throttling
        interceptWithDelay(200);

        uploadFile(fileName, () => {
            cy.get("#form-submit")
                .should("be.visible")
                .click();

            cy.wait(WAIT_X_LONG);

            cy.storyLog().assertFileItemStartFinish(fileName, 1);


            cy.storyLog().assertLogPattern(CHUNK_START, { times: 8 });
            cy.storyLog().assertLogPattern(CHUNK_FINISH, { times: 8 });

            cy.storyLog().customAssertLogEntry("CHUNK_FINISH", (logLines) => {
                let lastValue = -1, lastId = "";
                const loadedChunks = logLines.map(([{ chunk }]) =>`${chunk.id} - ${chunk.start}`).join(",");

                logLines.forEach(([data], index) =>{
                    const chunkStart = data.chunk.start;

                    expect(data.chunk.id).to.not.be.eq(lastId, `chunk ${index} finished. should have different id than: ${lastId}`);

                    expect(chunkStart,
                        `chunk ${index} finished. start value ${chunkStart} should be greater than previous chunk: ${lastValue}. chunks: ${loadedChunks}`)
                        .to.be.greaterThan(lastValue);

                    lastValue = chunkStart;
                    lastId = data.chunk.id;

                    if (index < (logLines.length - 1)) {
                        expect(data.item.loaded,
                            `chunk ${index} finished. uploaded ${data.item.loaded} should be less than total: ${data.item.file.size}`).to.be.lessThan(data.item.file.size);
                    }
                });
            }, { all: true });

            cy.storyLog().assertLogEntryContains(18, {
                id: "batch-1.item-1",
                completed: 100,
                loaded: 372445,
            });
        }, false);
    });
});
