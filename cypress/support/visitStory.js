Cypress.Commands.add("visitStory", (component, storyName) => {
    cy.log(`cmd.loadStory: component = ${component}, story = ${storyName}`);
    cy.visit(`${Cypress.env("storybookUrl")}${Cypress.env("components")[component]}--${storyName}`);
});
