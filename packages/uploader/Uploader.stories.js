import React from "react";
import { withKnobs } from "@storybook/addon-knobs";
import ScriptTag from "react-script-tag";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";


export const UMD_Core = () => {

    return <>
        <ScriptTag src={}/>
    </>
};

export default {
    title: "Uploader",
    decorators: [withKnobs],
    parameters: {
        readme: {
            sidebar: readme,
        },
        options: {
            showPanel: true,
            //needed until storybook-readme fixes their bug - https://github.com/tuchk4/storybook-readme/issues/221
            theme: {}
        },
    },
};
