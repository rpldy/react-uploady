// @flow
import React, { useCallback, useState, forwardRef, useMemo } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import {
    UmdBundleScript,
    localDestination,
    UMD_NAMES,
    addActionLogEnhancer,
	useStoryUploadySetup
} from "../../../story-helpers";
import { asUploadButton } from "@rpldy/upload-button";
import UploadPreview from "@rpldy/upload-preview";
import Uploady, {
    useUploadyContext,
    NoDomUploady,
    useUploadOptions,
    useBatchAddListener,
    useBatchFinishListener,
} from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

const ContextUploadButton = () => {
    const uploadyContext = useUploadyContext();

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
        <ListOfUploadOptions />
    </NoDomUploady>
};


const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UploadField = styled.div`
  width: 260px;
  height: 30px;
  line-height: 30px;
  border: 1px solid #fff;
  background-color: #f1f1f1;
  color: #000;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 0 4px;
  cursor: pointer;
`;

const MyUploadField = asUploadButton(
    forwardRef(({ onChange, ...props }, ref) => {
        const [text, setText] = useState("Select file");

        useBatchAddListener((batch) => {
            setText(batch.items[0].file.name);
            onChange(batch.items[0].file.name);
        });

        useBatchFinishListener(() => {
            setText("Select file");
            onChange(null);
        });

        return (
            <UploadField {...props} ref={ref}>
                {text}
            </UploadField>
        );
    })
);

const MyForm = () => {
    const [fields, setFields] = useState({});
    const [fileName, setFileName] = useState(null);
    const uploadyContext = useUploadyContext();

    const onSubmit = useCallback(() => {
        uploadyContext.processPending({params: fields});
    }, [fields, uploadyContext]);

    const onFieldChange = useCallback((e)=> {
        setFields({
            ...fields,
            [e.currentTarget.id]: e.currentTarget.value,
        })
    }, [fields, setFields]);

    const buttonExtraProps = useMemo(() => ({
        onChange:setFileName
    }), [setFileName]);

    return (
        <Form>
            <MyUploadField autoUpload={false} extraProps={buttonExtraProps}/>
            <br/>
            <input onChange={onFieldChange} id="field-name" type="text" placeholder="your name"/>
            <br/>
            <input onChange={onFieldChange} id="field-age" type="number" placeholder="your age"/>
            <br/>
            <button type="button" onClick={onSubmit} disabled={!fileName}>Submit Form</button>
        </Form>
    );
};

export const WithForm = () => {
    const { enhancer, destination, grouped, groupSize } = useStoryUploadySetup();

    return (
        <Uploady
            debug
            clearPendingOnAdd
            multiple={false}
            destination={destination}
            enhancer={enhancer}
            grouped={grouped}
            maxGroupSize={groupSize}>
        >
            <div className="App">
                <h3>Using a Form with file input and additional fields</h3>

                <MyForm />
                <br />
                <UploadPreview
                    fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"
                />
            </div>
        </Uploady>
    );
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
