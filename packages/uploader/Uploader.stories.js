import React, { useCallback, useState, useRef } from "react";
import {
    UmdBundleScript,
    localDestination,
    UMD_NAMES,
    addActionLogEnhancer
} from "../../story-helpers";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

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
