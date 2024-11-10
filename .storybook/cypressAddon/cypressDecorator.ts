import { makeDecorator } from "@storybook/preview-api";

export default makeDecorator({
    name: "cypressDecorator",
	wrapper: (getStory, context) => {
		const win = (window.parent && window.parent.Cypress) ?
			window.parent :
			(window.Cypress ? window : null);

		if (win) {
		    win.__cypressEnv = process.env.NODE_ENV;
			win.__cypressResults = win.__cypressResults || { storyLog: []};

            //clear story log on each story render
			win.__cypressResults.storyLog = [];
            delete win.__extUploadOptions;
            delete win.__extPreSendOptions;

            //TODO: this isnt a good practice to keep these special params in different places in the code. Need to refactor to cleaner solution
		}

		return getStory(context);
	},
    parameterName: "cypressDecorator",
    skipIfNoParametersOrOptions: false,
});
