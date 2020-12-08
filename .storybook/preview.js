import React from "react";
import { addDecorator } from "@storybook/react";
import { Description, } from "@storybook/addon-docs/blocks";
// import { addReadme } from "storybook-readme";
import cypressDecorator from "./cypressAddon/cypressDecorator";

// addDecorator(addReadme);
addDecorator(cypressDecorator);

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    docs: {
        page: () => <>
            <Description/>
        </>,
    },
};
