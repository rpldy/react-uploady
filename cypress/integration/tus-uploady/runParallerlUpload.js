import uploadFile from "../uploadFile";

export const getParallelSizes = (fileName, parallel) =>
    cy.get(`@${fileName}`)
        .then((uploadFile) => {
            const fileSize = uploadFile.length;
            cy.log(`GOT UPLOADED FILE Length ===> ${fileSize}`);
            const partSize = Math.floor(fileSize / parallel);
            return cy.wrap({ fileSize, partSize });
        });

const runParallelUpload = (fileName, parallel, testCb) => {
    let runCount = 0;

    const run = (cb) => {
        let partSize = 0, fileSize = 0;

        cy.get("input")
            .should("exist")
            .as("fInput");

        uploadFile(fileName, () => {
            cy.waitMedium();

            getParallelSizes(fileName, parallel)
                .then((sizes) => {
                    fileSize = sizes.fileSize;
                    partSize = sizes.partSize;
                });

            cy.storyLog()
                .assertFileItemStartFinish(fileName, 1 + (runCount * 4))
                .then((startFinishEvents) => {
                    cb(fileSize, partSize, startFinishEvents);
                });
        }, "#upload-button");

        return (nextCb) => {
            runCount += 1;
            return run(nextCb);
        };
    };

    return run(testCb);
};

export default runParallelUpload;
