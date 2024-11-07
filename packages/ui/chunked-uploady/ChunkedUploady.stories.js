// @flow
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import UploadButton from "@rpldy/upload-button";
import ChunkedUploady, {
    useRequestPreSend,
    useChunkStartListener,
    useChunkFinishListener,
    CHUNK_EVENTS,
} from "./src";
import {
    UMD_NAMES,
    DEFAULT_CHUNK_SIZE,
    createUploadyStory,
    StoryUploadProgress,
    StoryAbortButton,
    UmdBundleScript,
    logToCypress,
    getCsfExport,
    type CsfExport,
    type UploadyStory,
    type UploadyStoryParams,
} from "../../../story-helpers";
import Readme from "./ChunkedUploady.storydoc.mdx";

import type { Node } from "react";

//expose react and react-dom for Uploady bundle
window.react = React;
window["react-dom"] = ReactDOM;

const UploadButtonWithUniqueIdHeader = () => {
    useRequestPreSend((data) => {
        return {
            options: {
                destination: {
                    headers: {
                        "X-Unique-Upload-Id": `rpldy-chunked-uploader-${Date.now()}`,
                    },
                },
            },
        };
    });

    return <UploadButton id="upload-button"/>;
};

export const Simple: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, chunkSize, extOptions }): Node => {
        const { isSuccessfulCall } = extOptions || {};

        return (
            <ChunkedUploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                chunkSize={chunkSize}
                isSuccessfulCall={isSuccessfulCall}
            >
                <UploadButtonWithUniqueIdHeader/>
            </ChunkedUploady>
        );
    });

export const WithProgress: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, chunkSize }): Node => {
        return (
            <ChunkedUploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                chunkSize={chunkSize}
            >
                <StoryUploadProgress/>
                <UploadButtonWithUniqueIdHeader/>
            </ChunkedUploady>
        );
    });

export const WithAbortButton: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, chunkSize }): Node => {
        return (
            <ChunkedUploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                chunkSize={chunkSize}
            >
                <UploadButtonWithUniqueIdHeader/>
                <br/>
                <StoryAbortButton/>
            </ChunkedUploady>
        );
    });

const ChunkEventLog = ({ isAsync = false }: { isAsync?: boolean }) => {
    useChunkStartListener((data) => {
        console.log(`Chunk Start - ${data.chunk.id} - attempt: ${data.chunk.attempt}`, data);
        logToCypress(`###${CHUNK_EVENTS.CHUNK_START}`, data);
        return isAsync ? Promise.resolve(undefined) : undefined;
	});

    useChunkFinishListener((data) => {
        console.log(`Chunk Finish - ${data.chunk.id} - attempt: ${data.chunk.attempt}`, data);
        logToCypress(`###${CHUNK_EVENTS.CHUNK_FINISH}`, data);
        return isAsync ? Promise.resolve(undefined) : undefined;
	});

    return null;
};

export const WithChunkEventHooks: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, chunkSize }): Node => {
        return (
            <ChunkedUploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                chunkSize={chunkSize}
            >
                <UploadButtonWithUniqueIdHeader/>
                <ChunkEventLog/>
            </ChunkedUploady>
        );
    });

export const WithAsyncChunkEventHooks: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, chunkSize }): Node => {
        return (
            <ChunkedUploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                chunkSize={chunkSize}
            >
                <UploadButtonWithUniqueIdHeader/>
                <ChunkEventLog isAsync/>
            </ChunkedUploady>
        );
    });

//mimic rendering with react and ChunkedUploady loaded through <script> tags
const renderChunkedUploadyFromBundle = ({
                                            destination,
                                            enhancer,
                                        }: UploadyStoryParams) => {
    const rpldy = window.rpldy,
        react = window.react;

    const MyUploadButton = () => {
        rpldy.uploady.useRequestPreSend(() => {
            return {
                options: {
                    destination: {
                        headers: {
                            "X-Unique-Upload-Id": `umd-test-${Date.now()}`,
                        },
                    },
                },
            };
        });

        const uploadyContext = react.useContext(rpldy.uploady.UploadyContext);

        const onClick = react.useCallback(() => {
            uploadyContext.showFileUpload();
        });

        return react.createElement("button", {
            id: "upload-button",
            onClick: onClick,
            children: "Upload",
        });
    };

    const uploadyProps = {
        debug: true,
        destination,
        enhancer,
        chunkSize: 200000,
    };

    return react.createElement(
        rpldy.chunkedUploady.ChunkedUploady,
        uploadyProps,
        [react.createElement(MyUploadButton)],
    );
};

export const UMD_CoreChunkedUI: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
     }): Node => {
        const [UploadyUI, setUploadyUI] = useState(null);

        const onBundleLoad = useCallback(() => {
            const result = renderChunkedUploadyFromBundle({
                destination,
                enhancer,
            });
            setUploadyUI(result);
        }, [destination, enhancer]);

        return (
            <div>
                <UmdBundleScript bundle={UMD_NAMES.ALL} onLoad={onBundleLoad}/>
                {UploadyUI}
            </div>
        );
    });

const chunkedUploadyStories: CsfExport = getCsfExport(ChunkedUploady, "Chunked Uploady", Readme, {
    pkg: "chunked-uploady",
    section: "UI",
    parameters: {
        controls: {
            exclude: ["group"],
        }
    },
    args: {
        chunkSize: DEFAULT_CHUNK_SIZE,
    },
    argTypes: {
        chunkSize: { control: "number" }
    }
});

export default { ...chunkedUploadyStories, title: "UI/Chunked Uploady" };
