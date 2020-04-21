Cypress.Commands.add("visitStory", (component, storyName) => {
    cy.log(`cmd.loadStory: component = ${component}, story = ${storyName}`);

    const url = `${Cypress.env("storybookDomain")}:${Cypress.env("SB_PORT")}${Cypress.env("storybookPath")}`;

    cy.visit(`${url}${Cypress.env("components")[component]}--${storyName}`);
});
