// @flow
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import { withKnobs, number } from "@storybook/addon-knobs";
import UploadButton from "@rpldy/upload-button";
import ChunkedUploady, {
	useRequestPreSend,
	useChunkStartListener,
	useChunkFinishListener
} from "./src";
import {
	KNOB_GROUPS,
	UMD_NAMES,

	useStoryUploadySetup,
	StoryUploadProgress,
	StoryAbortButton,
	UmdBundleScript,
	localDestination,
	addActionLogEnhancer,
} from "../../../story-helpers";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

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

const ChunkEventLog = () => {

	console.log("RENDERNIG ChunkEventLog !!!!!!!")

	useChunkStartListener((data) => {
		console.log(`Chunk Start - ${data.chunk.id} - attempt: ${data.chunk.attempt}`, data);
	});

	useChunkFinishListener((data) => {
		console.log(`Chunk Finish - ${data.chunk.id} - attempt: ${data.chunk.attempt}`, data);
	});

	return null;
};

export const WithChunkEventHooks = () => {
	const { enhancer, destination, multiple, chunkSize } = useChunkedStoryHelper();

	return <ChunkedUploady
		debug
		multiple={multiple}
		destination={destination}
		enhancer={enhancer}
		chunkSize={chunkSize}>
		<UploadButtonWithUniqueIdHeader/>
		<ChunkEventLog/>
	</ChunkedUploady>
};

//mimic rendering with react and ChunkedUploady loaded through <script> tags
const renderChunkedUploadyFromBundle = () => {
    const MyUploadButton = () => {

        // $FlowFixMe - rpldy
        rpldy.uploady.useRequestPreSend(() => {
            return {
                options: {
                    destination: {
                        headers: {
                            "X-Unique-Upload-Id": `umd-test-${Date.now()}`,
                        }
                    }
                }
            };
        });

        // $FlowFixMe - react & rpldy
        const uploadyContext = react.useContext(rpldy.uploady.UploadyContext);

        const onClick = react.useCallback(()=>{
            uploadyContext.showFileUpload();
        });

        // $FlowFixMe - react & rpldy
        return react.createElement("button", {id: "upload-button", onClick: onClick, children: "Upload"});
    };

    const uploadyProps = {
        debug: true,
        destination: localDestination().destination,
        enhancer: addActionLogEnhancer(),
        chunkSize: 10000,
    };

    // $FlowFixMe - react & rpldy
    return react.createElement(
        // $FlowFixMe - react & rpldy
        rpldy.chunkedUploady.ChunkedUploady,
        uploadyProps,
        [react.createElement(MyUploadButton)]
    );
};

export const UMD_CoreChunkedUI = () => {
    const [UploadyUI, setUploadyUI] = useState(null);

    const onBundleLoad = useCallback(() => {
        const result = renderChunkedUploadyFromBundle();
        setUploadyUI(result);
    }, []);

    return <div>
        <UmdBundleScript bundle={UMD_NAMES.ALL} onLoad={onBundleLoad}/>

        {UploadyUI}
    </div>;
};

export default {
    component: ChunkedUploady,
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
