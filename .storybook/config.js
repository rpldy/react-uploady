import { configure } from "@storybook/react";

configure(require.context("../packages",
	true,
	/\.story\.js/), module);

// console.log("!!!!!!!!!!!!! CONTEXT",
// 	require.context("../packages", true, /\.story\.js/ ).keys());
///src\/\*\*\/\*\.story\.js$/