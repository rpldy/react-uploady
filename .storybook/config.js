import { configure } from "@storybook/react";

configure(require.context(
	"../packages",
	true,
	/src\/\*\*\/\*\.story\.js$/), module);