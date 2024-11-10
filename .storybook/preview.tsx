import React from "react";
import type { Preview } from "@storybook/react";
import { Description } from "@storybook/addon-docs";
//import { DocsContainer } from "@storybook/blocks";
import cypressDecorator from "./cypressAddon/cypressDecorator";
import UploadyStoryDecorator from "./UploadyStoryDecorator";

const preview: Preview = {
    parameters: {
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
            // container:  ({ children, ...props }) => {
            //     console.log("RENDERING DOCS CONTAINER !!!! !@#!@#!@#@#");
            //     return (
            //         <DocsContainer {...props}>{children}</DocsContainer>
            //     )
            // },
            page: () => {
                // console.log("RENDERING DOCS PAGE !!!! !@#!@#!#@!#");
                return (
                    <>
                        <Description/>
                    </>
                )
            },
        },
    },
    decorators: [UploadyStoryDecorator, cypressDecorator],
    tags: ["autodocs"],
};

export default preview;
