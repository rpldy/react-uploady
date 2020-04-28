
export default (fileName, cb, dropZone = "#upload-drop-zone", iframe = "@iframe") => {

    cy.get(iframe)
        .find(dropZone)
        .should("be.visible")
        .click()
        .as("uploadDropZone");

    cy.fixture(fileName, "base64").then((fileContent) => {
        cy.get("@uploadDropZone").upload(
            { fileContent, fileName, mimeType: "image/jpeg" },
            { subjectType: "drag-n-drop" });

        cb();
    });
};
