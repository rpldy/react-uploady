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

    get(`input[type="file"]`)
        .should("exist")
        .as("fInput");

    const times = options.times || 1;
    const mimeType = options.mimeType || "image/jpeg";
    const fileName = options.fileName || fixtureName;

    cy.fixture(fixtureName, "binary")
        .then(Cypress.Blob.binaryStringToBlob)
        .then((fileContent) => {
            const files = new Array(times)
                .fill(null)
                .map((f, i) => ({
                    fileContent,
                    mimeType,
                    fileName: !i ? fileName : fileName.replace(".", `${i + 1}.`),
                }));

            cy.get("@fInput")
                .attachFile(files)
                .then(cb);
        });
};

export const uploadFileTimes = (fileName, cb, times, button = "button", options = {}, iframe) => {
    return uploadFile(fileName, cb, button, { ...options, times, }, iframe);
};

export default uploadFile;
