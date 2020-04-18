// import "cypress-iframe";
import "./iframe";
import "cypress-file-upload";

Cypress.Commands.add("visitStory", (component, storyName) => {
    cy.log(`cmd.loadStory: component = ${component}, story = ${storyName}`);
    cy.visit(`${Cypress.env("storybookUrl")}${Cypress.env("components")[component]}--${storyName}`);
});

Cypress.Commands.add("storyLog", () =>
    cy.window().then((w) => {
        return w.__cypressResults.storyLog;
    }));

Cypress.Commands.add("assertItemStartFinish", { prevSubject: true }, (storyLog, fileName, startIndex = 0) => {
    console.log("assertItemStartFinish received log", storyLog);

    expect(storyLog[startIndex].args[0]).to.equal("ITEM_START");
    expect(storyLog[startIndex].args[1].file.name).to.equal(fileName);

    //TODO: this wont work with multiple files !! look for start event't batch item id
    expect(storyLog[startIndex + 1].args[0]).to.equal("ITEM_FINISH");
    expect(storyLog[startIndex + 1].args[1].file.name).to.equal(fileName);
});
