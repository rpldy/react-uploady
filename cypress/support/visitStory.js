Cypress.Commands.add("visitStory", (component, storyName, canvas = true) => {
    cy.log(`cmd.loadStory: component = ${component}, story = ${storyName}`);

    const sbUrlBase = `${Cypress.env("storybookDomain")}:${Cypress.env("SB_PORT")}`;

    const url = canvas ?
		`${sbUrlBase}/iframe.html?id=` :
		`${sbUrlBase}${Cypress.env("storybookPath")}`;

    cy.visit(`${url}${Cypress.env("components")[component]}--${storyName}`);
});
