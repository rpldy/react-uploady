const selectFiles = (fixtureName, triggerSelector, alias, cb, {
    times = 1,
    iframe = false,
    fileName,
    mimeType = "image/jpeg",
    force,
    action,
    aliasAsInput = false,
} = {}) => {
    console.log("SELECT FILES - ", {
        fixtureName,
        triggerSelector,
        alias,
        times,
        iframe,
        fileName,
        mimeType,
        force,
        action,
        aliasAsInput,
    });

    //support stories inside iframe and outside
    const get = (selector) => iframe ?
        cy.get(iframe).find(selector) : cy.get(selector);

    if (triggerSelector !== false) {
        get(triggerSelector)
            .should("be.visible")
            .click()
            .as(alias);
    }

    const usedFileName = fileName || fixtureName;

    cy.fixture(fixtureName, { encoding: null })
        .then((contents) => {
            const files = new Array(times)
                .fill(null)
                .map((f, i) => ({
                    contents,
                    mimeType,
                    fileName: !i ? usedFileName : usedFileName.replace(".", `${i + 1}.`),
                }));

            const inputSelector = aliasAsInput ? `@${alias}` : `input[type="file"]`
            get(inputSelector)
                .selectFile(files, { force, action })
                .then(cb);
        });
};

export default selectFiles;
