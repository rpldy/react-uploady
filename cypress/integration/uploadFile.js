const uploadFile = (fileName, cb, button = "button", iframe = "@iframe", options = {}) => {
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
        let files = [{ fileContent, fileName, mimeType: "image/jpeg" }];

        if (options.times) {
            files = files.concat(new Array(options.times - 1)
                .fill(null)
                .map((f, i) => ({
                    fileContent,
                    fileName: fileName.replace(".", `${i+2}.`),
                    mimeType: "image/jpeg"
                })));
        }

        cy.get("@fInput").upload(files, { subjectType: "input" });

        cb();
    });
};

export const uploadFileTimes = (fileName, cb, times, button = "button", iframe = "@iframe", options = {}) => {
    return uploadFile(fileName, cb, button, iframe, { times });
};

export default uploadFile;
