import uploadFile from "../uploadFile";

const runParallelUpload = (fileName, parallel, testCb) => {
    let runCount = 0;

    const run = (cb) => {
        let partSize = 0, fileSize = 0;

        cy.get("input")
            .should("exist")
            .as("fInput");

        uploadFile(fileName, () => {
            cy.waitMedium();

            cy.get(`@${fileName}`)
                .then((uploadFile) => {
                    fileSize = uploadFile.length;
                    cy.log(`GOT UPLOADED FILE Length ===> ${fileSize}`);
                    partSize = Math.floor(fileSize / parallel);
                });

            cy.storyLog()
                .assertFileItemStartFinish(fileName, 1 + (runCount * 4))
                .then((startFinishEvents) => {
                    cb(fileSize, partSize, startFinishEvents);
                });
        }, "#upload-button");

        return (nextCb) => {
            runCount += 1;
            run(nextCb);
        };
    }

    return run(testCb);
};

export default runParallelUpload;
