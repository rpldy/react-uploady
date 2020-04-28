export default (fileName, cb, button = "button", iframe = "@iframe") => {

    cy.get(iframe)
        .find(button)
        .should("be.visible")
        .click()
        .as("uploadButton");

    cy.get(iframe)
        .find("input")
        .should("exist")
        .as("fInput");

    cy.fixture(fileName, "base64").then((fileContent) => {
        cy.get("@fInput").upload(
            { fileContent, fileName, mimeType: "image/jpeg" },
            { subjectType: "input" });

        cb();
    });
};
