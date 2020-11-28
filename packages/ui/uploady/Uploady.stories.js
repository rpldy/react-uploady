// @flow
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import {
    UmdBundleScript,
    localDestination,
    UMD_NAMES,
    addActionLogEnhancer,
	useStoryUploadySetup
} from "../../../story-helpers";
import Uploady, {
    useUploady,
    NoDomUploady,
    useUploadOptions,
} from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

const ContextUploadButton = () => {
    const uploadyContext = useUploady();

    const onClick = useCallback(() => {
        uploadyContext?.showFileUpload();
    }, [uploadyContext]);

    return <button onClick={onClick}>Custom Upload Button</button>
};

export const ButtonWithContextApi = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>
        <ContextUploadButton/>
    </Uploady>
};

const UrlUploadButton = () => {
    const uploady = useUploady();

    const onClick = useCallback(() => {
        uploady.upload("http://image.com/someimage.jpg");
    }, [uploady]);

    return <button onClick={onClick}>Url Upload</button>;
};


export const UrlUploadWithContextApi = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>
        <UrlUploadButton/>
    </Uploady>
};

const ListOfUploadOptions = () => {
    const options = useUploadOptions();

    return <ul>
        {Object.entries(options).map(([key, val]) =>
            <li key={key}>{key} = {JSON.stringify(val)}</li>)}
    </ul>
};

export const WithNoDomUploady = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <NoDomUploady
        debug
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>
        <ListOfUploadOptions/>
    </NoDomUploady>
};

//expose react and react-dom for Uploady bundle
window.react = React;
window["react-dom"] = ReactDOM;

//mimic rendering with react and react-uploady loaded through <script> tags
const renderUploadyFromBundle = () => {
    const MyUploadButton = () => {
        // $FlowFixMe - react & rpldy
        const uploadyContext = react.useContext(rpldy.UploadyContext);

        const onClick = react.useCallback(() => {
            uploadyContext.showFileUpload();
        });

        return react.createElement("button", {
            id: "upload-button",
            onClick: onClick,
            children: "Upload"
        });
    };

    const uploadyProps = {
        debug: true,
        destination: localDestination().destination,
        enhancer: addActionLogEnhancer(),
    };

    // $FlowFixMe - react & rpldy
    return react.createElement(
        // $FlowFixMe - react & rpldy
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
    // $FlowFixMe - react & rpldy
    const uploadButton = react.createElement(rpldy.uploadButton.UploadButton, { id: "upload-button" });

    // $FlowFixMe - react & rpldy
    const uploadPreview = react.createElement(rpldy.uploadPreview.UploadPreview, {
        id: "upload-preview",
        previewComponentProps: { "data-test": "upload-preview" },
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
	component: Uploady,
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
