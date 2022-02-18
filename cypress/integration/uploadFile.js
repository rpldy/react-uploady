const uploadFile = (fixtureName, cb, button = "button", options = {}) => {
    //support stories inside iframe and outside
    const get = (selector) => options.iframe ?
        cy.get(options.iframe).find(selector) : cy.get(selector);

    if (button !== false) {
        get(`#root ${button}`)
            .should("be.visible")
            .click()
            .as("uploadButton");
    }

    const times = options.times || 1;
    const mimeType = options.mimeType || "image/jpeg";
    const fileName = options.fileName || fixtureName;

    cy.fixture(fixtureName, { encoding: null })
        .then((contents) => {
            const files = new Array(times)
                .fill(null)
                .map((f, i) => ({
                    contents,
                    mimeType,
                    fileName: !i ? fileName : fileName.replace(".", `${i + 1}.`),
                }));

            get(`input[type="file"]`)
                .selectFile(files, { force: true })
                .then(cb);
        });
};

export const uploadFileTimes = (fileName, cb, times, button = "button", options = {}, iframe) =>
    uploadFile(fileName, cb, button, { ...options, times, }, iframe);

export default uploadFile;
