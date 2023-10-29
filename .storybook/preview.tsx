import type { Preview } from "@storybook/react";
import { Description } from "@storybook/addon-docs";
import React from "react";
import cypressDecorator from "./cypressAddon/cypressDecorator";
import UploadyStoryDecorator from "./UploadyStoryDecorator";

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: "^on[A-Z].*" },
        options: {
            storySort: {
                method: "alphabetical",
            },
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        docs: {
            page: () => <>
                <Description/>
            </>,
        },
    },
    decorators: [UploadyStoryDecorator, cypressDecorator],
};

export default preview;
