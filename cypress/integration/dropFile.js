
export default (fileName, cb, dropZone = "#upload-drop-zone") => {
    cy.get(dropZone)
        .should("be.visible")
        .click()
        .as("uploadDropZone");

    cy.fixture(fileName, "base64").then((fileContent) => {
        cy.get("@uploadDropZone").attachFile(
            { fileContent, fileName, mimeType: "image/jpeg" },
            { subjectType: "drag-n-drop" });

        cb();
    });
};
