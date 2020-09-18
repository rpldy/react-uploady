import React from "react";
import { makeDecorator } from "@storybook/addons";

export default makeDecorator({
	name: "cypressDecorator",
	wrapper: (getStory, context) => {
		const win = (window.parent && window.parent.Cypress) ?
			window.parent :
			(window.Cypress ? window : null);

		if (win) {
			win.__cypressResults = win.__cypressResults || { storyLog: []};
			//clear story log on each story render
			win.__cypressResults.storyLog = [];
		}

		return getStory(context);
	}
})
