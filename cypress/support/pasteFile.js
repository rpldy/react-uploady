const dispatchPasteEvent = (element, dataTransfer) => {
    const e = new CustomEvent("paste", {
        bubbles: true,
        cancelable: true,
        detail: dataTransfer,
    });

    Object.assign(e, { clipboardData: dataTransfer });

    element.dispatchEvent(e);
};

Cypress.Commands.add("pasteFile", { prevSubject: true },
    (subject, fixtureName, times = 1, mimeType = "image/jpeg") => {

        cy.window({ log: false }).then((window) => {
            cy.fixture(fixtureName, "binary")
                .then(Cypress.Blob.binaryStringToBlob)
                .then((fileContent) => {

                    console.log("!!!!!!!!!!! PASTING !!!!!!! ", {
                        fixtureName,
                        fileContent,
                    });

                    const dataTransfer = new window.DataTransfer();

                    new Array(times)
                        .fill(null)
                        .forEach((f, i) => {
                            const fileName = !i ? fixtureName : fixtureName.replace(".", `${i + 1}.`);
                            const file = new window.File([fileContent], fileName, { type: mimeType });
                            dataTransfer.items.add(file);
                        });

                    const element = subject[0];

                    dispatchPasteEvent(element, dataTransfer);
                });
        });

        return cy.wrap(subject, { log: false });
    });
