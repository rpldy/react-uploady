// @flow
import React, { useCallback, useState, useRef, useEffect } from "react";
import {
    UmdBundleScript,
    localDestination,
    UMD_NAMES,
    addActionLogEnhancer,
    useStoryUploadySetup,
} from "../../story-helpers";
import createUploader from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

export const WithCustomUI = () => {
    const { enhancer, destination, grouped, groupSize } = useStoryUploadySetup();
    const uploaderRef = useRef(null);
    const inputRef = useRef(null);

    const onClick = useCallback(() => {
        const input = inputRef.current;
        if (input) {
            input.click();
        }
    }, []);

    const onInputChange = useCallback(() => {
        uploaderRef.current.add(inputRef.current.files);
    }, []);

    useEffect(() => {
        uploaderRef.current = createUploader({
            enhancer,
            destination,
            grouped,
            groupSize
        });
    }, [enhancer, destination, grouped, groupSize]);

    return <div>
        <p>Uses the uploader as is, without the rpldy React wrappers</p>
        <input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
        <button id="upload-button" onClick={onClick}>Upload</button>
    </div>;
};

export const UMD_Core = () => {
    const [uploaderReady, setUploaderReady] = useState(false);
    const inputRef = useRef(null);
    const uploaderRef = useRef(null);

    const onBundleLoad = useCallback(() => {
        uploaderRef.current = window.rpldy.createUploader({
            destination: localDestination().destination,
            enhancer: addActionLogEnhancer(),
        });

        setUploaderReady(true);
    }, []);

    const onClick = useCallback(() => {
        const input = inputRef.current;
        if (input) {
            input.click();
        }
    }, []);

    const onInputChange = useCallback(() => {
        uploaderRef.current.add(inputRef.current.files);
    }, []);

    return <div>
        <UmdBundleScript bundle={UMD_NAMES.CORE} onLoad={onBundleLoad}/>

        <input type="file" ref={inputRef} style={{ display: "none" }}
               onChange={onInputChange}/>

        <h2>uploading to: {localDestination().destination.url}</h2>

        {uploaderReady && <button id="upload-button" onClick={onClick}>Upload</button>}
    </div>;
};

export default {
    title: "Uploader",
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
