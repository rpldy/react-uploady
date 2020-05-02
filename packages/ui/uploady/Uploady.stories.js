import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import {
    UmdBundleScript,
    localDestination,
    UMD_NAMES,
    addActionLogEnhancer
} from "../../../story-helpers";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

//expose react and react-dom for Uploady bundle
window.react = React;
window["react-dom"] = ReactDOM;

//mimic rendering with react and react-uploady loaded through <script> tags
const renderUploadyFromBundle = () => {
    const MyUploadButton = () => {
        const uploadyContext = react.useContext(rpldy.UploadyContext);

        const onClick = react.useCallback(()=>{
            uploadyContext.showFileUpload();
        });

        return react.createElement("button", {id: "upload-button", onClick: onClick, children: "Upload"});
    };

    const uploadyProps = {
        debug: true,
        destination: localDestination().destination,
        enhancer: addActionLogEnhancer(),
    };

    return react.createElement(
        rpldy.Uploady,
        uploadyProps,
        [react.createElement(MyUploadButton)]
    );
};

export const UMD_CoreUI = () => {
    const [UploadyUI, setUploadyUI] = useState(null);

    const onBundleLoad = useCallback(() => {
        const result = renderUploadyFromBundle();

        setUploadyUI(result);
    }, []);

    return <div>
        <UmdBundleScript bundle={UMD_NAMES.CORE_UI} onLoad={onBundleLoad}/>

        {UploadyUI}
    </div>;
};

//mimic rendering with react and react-uploady with UploadButton&UploadPreview loaded through <script> tags
const renderUploadyAll = () => {
    console.log(rpldy.uploadButton.UploadButton);
    const uploadButton = react.createElement(rpldy.uploadButton.UploadButton, {id: "upload-button"});

    const uploadPreview = react.createElement(rpldy.uploadPreview.UploadPreview, {
        id: "upload-preview",
        previewComponentProps:{"data-test": "upload-preview"},
    });

    const uploadyProps = {
        debug: true,
        destination: localDestination().destination,
        enhancer: addActionLogEnhancer(),
    };

    return react.createElement(
        rpldy.uploady.Uploady,
        uploadyProps,
        [uploadButton, uploadPreview]);
};

export const UMD_ALL = () => {
    const [UploadyUI, setUploadyUI] = useState(null);

    const onBundleLoad = useCallback(() => {
        const result = renderUploadyAll();
        setUploadyUI(result);
    }, []);

    return <div>
        <UmdBundleScript bundle={UMD_NAMES.ALL} onLoad={onBundleLoad}/>

        {UploadyUI}
    </div>;
};

export default {
    title: "Uploady",
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
