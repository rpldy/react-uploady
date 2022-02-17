const dropFile = (fileName, cb, dropZone = "#upload-drop-zone") => {
    cy.get(dropZone)
        .should("be.visible")
        .click()
        .as("uploadDropZone");

    cy.fixture(fileName, { encoding: null })
        .then((contents) => {
            cy.get("@uploadDropZone")
                .selectFile({
                        contents,
                        fileName,
                        mimeType: "image/jpeg"
                    },
                    { action: "drag-drop" })
                .then(cb);
        });
};

export default dropFile;
