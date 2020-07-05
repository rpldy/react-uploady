const uploadFile = (fileName, cb, button = "button", iframe = "@iframe", options = {}) => {
	//support stories inside iframe and outside
	const get = (selector) => iframe ? cy.get(iframe).find(selector) : cy.get(selector);

	get(button)
        .should("be.visible")
        .click()
        .as("uploadButton");

	get("input")
        .should("exist")
        .as("fInput");

	const mimeType = options.mimeType || "image/jpeg";

    cy.fixture(fileName, "base64").then((fileContent) => {
        let files = [{ fileContent, fileName, mimeType  }];

        if (options.times) {
            files = files.concat(new Array(options.times - 1)
                .fill(null)
                .map((f, i) => ({
                    fileContent,
                    fileName: fileName.replace(".", `${i+2}.`),
                    mimeType,
                })));
        }

        cy.get("@fInput")
			.upload(files, { subjectType: "input" })
			.then(cb);
    });
};

export const uploadFileTimes = (fileName, cb, times, button = "button", iframe = "@iframe", options = {}) => {
    return uploadFile(fileName, cb, button, iframe, { times });
};

export default uploadFile;
