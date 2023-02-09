import React from "react";
import { Description } from "@storybook/addon-docs";
import cypressDecorator from "./cypressAddon/cypressDecorator";
import UploadyStoryDecorator from "./UploadyStoryDecorator";

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },

    options: {
        storySort: {
            method: "alphabetical",
        },
    },

    docs: {
        page: () => <>
            <Description/>
        </>,
    },
};

export const decorators = [UploadyStoryDecorator, cypressDecorator];
