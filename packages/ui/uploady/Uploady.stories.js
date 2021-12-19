// @flow
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import {
    UmdBundleScript,
    localDestination,
    UMD_NAMES,
    addActionLogEnhancer,
    useStoryUploadySetup,
    getCsfExport,
    StoryAbortButton,

    type CsfExport,
} from "../../../story-helpers";
import { getUploadyVersion } from "@rpldy/shared-ui";
import Uploady, {
    FILE_STATES,

    useUploady,
    useFileInput,
    NoDomUploady,
    useUploadOptions,
    useBatchAddListener,
    useItemStartListener,
    useItemFinishListener,
    useItemErrorListener,
    useItemCancelListener,
    useItemAbortListener,
    useRequestPreSend,

    type PreSendData,
} from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

import type { Node, Element } from "React";

const ContextUploadButton = () => {
    const uploadyContext = useUploady();

    const onClick = useCallback(() => {
        uploadyContext?.showFileUpload();
    }, [uploadyContext]);

    return <button id="upload-button" onClick={onClick}>Custom Upload Button</button>
};

export const ButtonWithContextApi = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize, extOptions } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}
        {...extOptions}
    >

        version <span id="uploady-version">{getUploadyVersion()}</span>
        <br/>
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

export const UrlUploadWithContextApi = (): Node => {
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

export const WithNoDomUploady = (): Node => {
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

export const WithCustomFieldName = (): Node => {
    const { enhancer, destination, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady
        inputFieldName="customFieldName"
        debug
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>
        <p>Send upload request with custom field name</p>
        <ContextUploadButton />
    </Uploady>
};

const ProcessPending = ({ id = "process-pending", title = "PROCESS PENDING", options = undefined}) => {
    const { processPending } = useUploady();
    return <button id={id}
                   onClick={() => processPending(options)}>{title}</button>;
}

const ClearPending = () => {
    const { clearPending } = useUploady();
    return <button id="clear-pending" onClick={clearPending}>CLEAR PENDING</button>;
};

const STATE_COLORS = {
    [FILE_STATES.ADDED]: "black",
    [FILE_STATES.FINISHED]: "green",
    [FILE_STATES.UPLOADING]: "blue",
    [FILE_STATES.ERROR]: "red",
    [FILE_STATES.PENDING]: "gray",
    [FILE_STATES.ABORTED]: "orange",
    [FILE_STATES.CANCELLED]: "magenta",
};

const QueueItem = ({ item }) => {
    const { id } = item;
    const [state, setState] = useState(item.state);

    useItemStartListener(() => setState(FILE_STATES.UPLOADING), id);
    useItemFinishListener(() => setState(FILE_STATES.FINISHED), id);
    useItemErrorListener(() => setState(FILE_STATES.ERROR), id);
    useItemCancelListener(() => setState(FILE_STATES.CANCELLED), id);
    useItemAbortListener(() => setState(FILE_STATES.ABORTED), id);

    return <li data-test="queue-item">
        <span>NAME: {item.file.name}</span>
        <br/>
        <span>STATE:
            <span data-test="queue-item-state" style={{ color: STATE_COLORS[state] }}>{state}</span>
        </span>
        <br/>
        <span>BATCH: {item.batchId}</span>
        <hr/>
    </li>;
};

const QueueList = () => {
    const [items, setItems] = useState([]);

    useBatchAddListener((batch) => {
        setItems((prev) => [...prev, ...batch.items]);
    });

   return <ul data-test="queue-list">
        {items.map((item) => (
            <QueueItem key={item.id} item={item} />
        ))}
    </ul>
};

export const WithAutoUploadOff = (): Node => {
    const { enhancer, destination, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady
        debug
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}
        autoUpload={false}
        concurrent
        maxConcurrent={10}
    >
        <ContextUploadButton />
        <br/>
        <hr/>

        <QueueList/>

        <hr/>
        <ProcessPending/>
        <br/>
        <ProcessPending
            id="process-pending-param"
            title="PROCESS PENDING WITH PARAM"
            options={{ params: { test: "123" } }}/>
        <br/>
        <ClearPending/>
        <hr/>
        <br/>
        <StoryAbortButton/>
    </Uploady>
};

export const WithAbort = (): Element<"div"> => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    return <div>
        <p>Be prepared to click the abort button as soon as it appears once upload begins</p>
        <Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}>

            <ContextUploadButton />
            <StoryAbortButton/>
        </Uploady>
    </div>
};

export const WithConcurrent = (): Node => {
    const { enhancer, destination, grouped, groupSize, autoUpload } = useStoryUploadySetup();

    return <Uploady
        debug
        concurrent
        maxConcurrent={10}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}
        autoUpload={autoUpload}>
        <p>Send concurrent uploads</p>
        <ContextUploadButton />
        <br/>
        <ProcessPending />
    </Uploady>
};

export const WithCustomResponseFormat = (): Node => {
    const { enhancer, destination, grouped, groupSize, autoUpload } = useStoryUploadySetup();

    const resFormatter = useCallback((res, status, headers) => {
        console.log("!!!!!! running custom server response formatter", res, status, headers);
        return `${status} - Yay!`;
    }, []);

    return <Uploady
        debug
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}
        autoUpload={autoUpload}
        formatServerResponse={resFormatter}>
        <ContextUploadButton />
    </Uploady>;
};

const UploadFormWithInternalInput = () => {
    const inputRef = useFileInput();

    const onSelectChange = useCallback((e) => {
        if (e.target.value === "dir") {
            inputRef?.current?.setAttribute("webkitdirectory", "true");
        } else {
            inputRef?.current?.removeAttribute("webkitdirectory");
        }
    }, []);

    return <>
        <select id="select-input-type" onChange={onSelectChange}>
            <option value="file">File</option>
            <option value="dir">Directory</option>
        </select>
        <ContextUploadButton/>
    </>;
};

export const withExposedInternalInput = (): Node => {
    const { enhancer, destination, grouped, groupSize, autoUpload } = useStoryUploadySetup();

    return <Uploady
        debug
        concurrent
        maxConcurrent={10}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}
        autoUpload={autoUpload}>

        <UploadFormWithInternalInput/>
    </Uploady>;
};

const ExampleRequestPreSend = () => {
    const [namesLengths, setLengths] = useState("");

    useRequestPreSend(({ items }: PreSendData) => {
        const namesLengths = items.filter((item) => !!item.file)
            .map((item) => item.file.name.length)
            .join(",");

        setLengths(namesLengths);

        return {
            options: {
                destination: {
                    headers: {
                        "x-file-names-lengths": namesLengths,
                    }
                },
                ...(window.parent.__extPreSendOptions || {})
            }
        };
    });

    return namesLengths ? <p>{namesLengths}</p> : null;
};

export const withHeaderFromFileName = (): Node => {
    const { enhancer, destination, grouped, groupSize, autoUpload, extOptions } = useStoryUploadySetup();

    return <Uploady
        debug
        concurrent
        maxConcurrent={10}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}
        autoUpload={autoUpload}
        {...extOptions}
    >
        <ExampleRequestPreSend/>
        <ContextUploadButton/>
    </Uploady>;
};

//expose react and react-dom for Uploady bundle
window.react = React;
window["react-dom"] = ReactDOM;

//mimic rendering with react and react-uploady loaded through <script> tags
const renderUploadyFromBundle = () => {
    let result;

    try {
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
        result = react.createElement(
            // $FlowFixMe - react & rpldy
            rpldy.Uploady,
            uploadyProps,
            [react.createElement(MyUploadButton)]
        );
    }
    catch (ex){
        // $FlowFixMe - react
        result = react.createElement("p", { style: {"color": "red"}, children: `ERROR !!! ${ex.message}` });
    }

    return result;
};

export const UMD_CoreUI = (): Element<"div"> => {
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

export const UMD_ALL = (): Element<"div"> => {
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

export default (getCsfExport(Uploady, "Uploady", readme): CsfExport);
