Cypress.Commands.add("visitStory", (component, storyName, {
    canvas = true,
    useMock = true,
    uploadUrl = "http://test.upload/url",
} = {}) => {
    cy.log(`cmd.loadStory: component = ${component}, story = ${storyName}`);

    const urlBase = canvas ?
		`iframe.html?id=` :
		`${Cypress.env("storybookPath")}`;

    const urlWithStory = `${urlBase}${Cypress.env("components")[component]}--${storyName}`;

    cy.visit(
        !useMock ?
            urlWithStory + `&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=${uploadUrl}` :
            urlWithStory
    );
});


// &knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url
//&knob-mock send delay_Upload Destination=500
