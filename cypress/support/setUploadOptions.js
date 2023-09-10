Cypress.Commands.add("setUploadOptions", (options) =>
    //cy.wrap(window.parent)
    cy.window()
        .then((w) => {
            if (w._setUploadOptions) {
                w._setUploadOptions(options);
            } else {
                w.__extUploadOptions = options;
            }
        }));

Cypress.Commands.add("setPreSendOptions", (options) =>
    //cy.wrap(window.parent)
    cy.window()
        .then((w) => {
            w.__extPreSendOptions = options;
        }));
