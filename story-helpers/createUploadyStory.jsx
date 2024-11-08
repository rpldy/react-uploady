// @flow
import React from "react";
import useStoryUploadySetupFromArgs from "./storySetupControls/useStoryUploadySetupFromArgs";

import type { Node } from "react";
import type { Destination } from "@rpldy/shared";
import type { UploaderEnhancer } from "@rpldy/uploader";

export type UploadyStory = {
    render: (args: any) => Node,
    args?: any,
    argTypes?: any,
};

export type UploadyStoryParams = {
    uploadType?: string,
    destination?: Destination,
    multiple?: boolean,
    enhancer?: UploaderEnhancer<any>
};

const createUploadyStory = (Component: React$AbstractComponent<any, any>, storyParams: {| args?: any, argTypes?: any |} = {}): UploadyStory => {
    return {
        render: (args): Node => {
            const setupProps = useStoryUploadySetupFromArgs(args);
            return <Component {...setupProps} />;
        },
        ...storyParams
    };
};

export default createUploadyStory;
