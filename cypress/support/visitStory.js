import { UPLOAD_URL } from "../constants";

const getStoryControlsArgs = (options) => {
    const args = [];

    const uploadType = (!options.uploadType && (options.uploadUrl || options.useMock === false)) ?
        "url" :
        //default uploadType = mock
        (options.uploadType || "mock");

    args.push(`uploadType:${uploadType}`);
    args.push(`uploadUrl:${options.uploadUrl || UPLOAD_URL}` );

    if (options.chunkSize) {
        args.push(`chunkSize:${options.chunkSize}`);
    }

    if (options.mockDelay) {
        args.push(`mockSendDelay:${options.mockDelay}`);
    }

    //default multiple = true
    args.push(`multiple:!${options.multiple !== false}`);
    //default autoUpload = true
    args.push(`autoUpload:!${options.autoUpload !== false}`);
    //default grouped = false
    args.push(`grouped:!${options.grouped === true}`);

    if (options.uploadParams)   {
        Object.entries(options.uploadParams)
            .forEach(([key, val]) => args.push(`uploadParams.${key}:${val}`));
    }

    //default resumeStorage = true
    args.push(`resumeStorage:!${options.tusResumeStorage !== false}`);
    //default sendDataOnCreate = false
    args.push(`sendDataOnCreate:!${options.tusSendOnCreate === true}`);
    //default sendWithCustomHeader = false
    args.push(`sendWithCustomHeader:!${options.tusSendWithCustomHeader === true}`);
    //default ignoreModifiedDateInStorage = false
    args.push(`ignoreModifiedDateInStorage:!${options.tusIgnoreModifiedDateInStorage === true}`);

    if (options.customArgs) {
        Object.entries(options.customArgs)
            .forEach(([key, val]) => args.push(`${key}:${val}`));
    }

    //adding custom _uploadUrl param because SB filters out the url arg due to unsafe chars (in Canvas mode) :(
    const argsStr = "&args=" + args.join(";") + (uploadType !== "mock" ? "&_uploadUrl=" + (options.uploadUrl || UPLOAD_URL) : "");
    cy.log("cmd.visitStory: STORY ARGS = " + argsStr);

    return argsStr;
};

Cypress.Commands.add("visitStory", (component, storyName, options = {}) => {
    const { canvas = true } = options;
    cy.log(`cmd.visitStory: component = ${component}, story = ${storyName}, canvas = ${canvas}`);

    const urlBase = canvas ?
		`iframe.html?&viewMode=story&id=` :
		`${Cypress.env("storybookPath")}`;

    const urlWithStory = `${urlBase}${Cypress.env("components")[component]}--${storyName}`;

    cy.visit(urlWithStory + getStoryControlsArgs(options));
});
