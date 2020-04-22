// @flow
import React from "react";
import { withKnobs, number } from "@storybook/addon-knobs";
import UploadButton from "@rpldy/upload-button";
import ChunkedUploady, { useRequestPreSend } from "./src"
import {
    KNOB_GROUPS,
    useStoryUploadySetup,
    StoryUploadProgress,
    StoryAbortButton,
} from "../../../story-helpers";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

const UploadButtonWithUniqueIdHeader = () => {
    useRequestPreSend((data) => {
        return {
            options: {
                destination: {
                    headers: {
                        "X-Unique-Upload-Id": `rpldy-chunked-uploader-${Date.now()}`,
                    }
                }
            }
        };
    });

    return <UploadButton/>
};

const useChunkedStoryHelper = () => {
    const setup = useStoryUploadySetup({ noGroup: true });
    const chunkSize = number("chunk size (bytes)", 5242880, {}, KNOB_GROUPS.SETTINGS);

    return { ...setup, chunkSize };
};

export const Simple = () => {
    const { enhancer, destination, multiple, chunkSize } = useChunkedStoryHelper();

    return <ChunkedUploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        chunkSize={chunkSize}>
        <UploadButtonWithUniqueIdHeader/>
    </ChunkedUploady>;
};

export const WithProgress = () => {
    const { enhancer, destination, multiple, chunkSize } = useChunkedStoryHelper();

    return <ChunkedUploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        chunkSize={chunkSize}>
        <StoryUploadProgress/>
        <UploadButtonWithUniqueIdHeader/>
    </ChunkedUploady>;
};

export const WithAbortButton = () => {
    const { enhancer, destination, multiple, chunkSize } = useChunkedStoryHelper();

    return <ChunkedUploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        chunkSize={chunkSize}>
        <UploadButtonWithUniqueIdHeader/>
        <br/>
        <StoryAbortButton/>
    </ChunkedUploady>
};

export default {
    component: UploadButton,
    title: "Chunked Uploady",
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
