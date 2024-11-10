// @flow
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import {
    UmdBundleScript,
    UMD_NAMES,
    addActionLogEnhancer,
    getCsfExport,
    StoryAbortButton,
    logToCypress,
    mockDestination,
    createUploadyStory,
    type CsfExport,
    type UploadyStory,
    type UploadyStoryParams,
} from "../../../story-helpers";
import { getUploadyVersion, useBatchErrorListener } from "@rpldy/shared-ui";
import Uploady, {
    FILE_STATES,
    UPLOADER_EVENTS,
    useUploady,
    useFileInput,
    NoDomUploady,
    useUploadOptions,
    useBatchStartListener,
    useBatchAddListener,
    useItemStartListener,
    useItemFinishListener,
    useItemErrorListener,
    useItemCancelListener,
    useItemAbortListener,
    useRequestPreSend,
    type PreSendData,
} from "./src";
import Readme from "./Uploady.storydoc.mdx";

import type { Node } from "react";
import type { Batch, BatchItem } from "@rpldy/shared";

const ContextUploadButton = ({ text = "Custom Upload Button" }: { text?: string, ... }) => {
    const uploadyContext = useUploady();

    const onClick = useCallback(() => {
        uploadyContext?.showFileUpload();
    }, [uploadyContext]);

    // useBatchProgressListener(({ completed, loaded, total}) => {
    //     console.log("------- BATCH PROGRESS --------------", { completed, loaded, total })
    // });

    return <button id="upload-button" onClick={onClick}>{text}</button>;
};

type ContextButtonWithHooksProps = {|
    delayPreSend?: number,
    delayBatchStart?: number,
    preSendData?: Object,
|};

const ContextUploadButtonWithPrepareHooks = (props: ?ContextButtonWithHooksProps) => {
    console.log("Rendering Context Upload Button with Prepare Hooks (pre-send & batch-start)");

    useRequestPreSend(() => {
        return props?.delayPreSend ?
            new Promise((resolve) =>
                setTimeout(() => resolve(props.preSendData || {}), props.delayPreSend)) :
            true;
    });

    useBatchStartListener(() => {
        return props?.delayBatchStart ?
            new Promise((resolve) =>
                setTimeout(() => resolve(props.preSendData || {}), props.delayBatchStart)) :
            true;
    });

    return <ContextUploadButton {...props} />;
};

export const WithContextApiButton: UploadyStory = createUploadyStory(
    ({
         multiple,
         destination,
         enhancer,
         grouped,
         groupSize,
         extOptions
     }): Node => {
        const usePrepareEvents = !!extOptions?.withPrepareEvents;

        return (
            <Uploady
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
                {usePrepareEvents ? (
                    <ContextUploadButtonWithPrepareHooks {...extOptions} />
                ) : (
                    <ContextUploadButton {...extOptions} />
                )}
            </Uploady>
        );
    });

const UrlUploadButton = () => {
    const uploady = useUploady();

    const onClick = useCallback(() => {
        uploady.upload("http://image.com/someimage.jpg");
    }, [uploady]);

    return <button onClick={onClick}>Url Upload</button>;
};

export const UrlUploadWithContextApi: UploadyStory = createUploadyStory(
    ({
         multiple,
         destination,
         enhancer,
         grouped,
         groupSize,
     }): Node => {
        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <UrlUploadButton/>
            </Uploady>
        );
    });

const ListOfUploadOptions = () => {
    const options = useUploadOptions();

    return <ul>
        {Object.entries(options).map(([key, val]) =>
            <li key={key}>{key} = {JSON.stringify(val)}</li>)}
    </ul>
};

export const WithNoDomUploady: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         grouped,
         groupSize,
     }): Node => {
        return (
            <NoDomUploady
                debug
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <ListOfUploadOptions/>
            </NoDomUploady>
        );
    });

export const WithCustomFieldName: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         grouped,
         groupSize,
     }): Node => {
        return (
            <Uploady
                inputFieldName="customFieldName"
                debug
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <p>Send upload request with custom field name</p>
                <ContextUploadButton/>
            </Uploady>
        );
    });

export const WithDirectory: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         grouped,
         groupSize,
     }): Node => {
        return (
            <Uploady
                inputFieldName="customFieldName"
                debug
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
                webkitdirectory
            >
                <p>Upload directory</p>
                <ContextUploadButton/>
            </Uploady>
        );
    });

type ProcessPendingProps = {|
    id?: string,
    title?: string,
    options?: ?Object,
|};

const ProcessPending = ({ id = "process-pending", title = "PROCESS PENDING", options = undefined } : ProcessPendingProps) => {
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

const QueueItem = ({ item }: { item: BatchItem }) => {
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
    const [items, setItems] = useState<BatchItem[]>([]);

    useBatchAddListener((batch) => {
        setItems((prev) => [...prev, ...batch.items]);
    });

   return <ul data-test="queue-list">
        {items.map((item) => (
            <QueueItem key={item.id} item={item} />
        ))}
    </ul>
};

export const WithAutoUploadOff: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         grouped,
         groupSize,
         extOptions,
     }): Node => {
        return (
            <Uploady
                debug
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
                autoUpload={false}
                concurrent
                maxConcurrent={10}
                {...extOptions}
            >
                <ContextUploadButton/>
                <br/>
                <hr/>

                <QueueList/>

                <hr/>
                <ProcessPending/>
                <br/>
                <ProcessPending
                    id="process-pending-param"
                    title="PROCESS PENDING WITH PARAM"
                    options={{ params: { test: "123" } }}
                />
                <br/>
                <ClearPending/>
                <hr/>
                <br/>
                <StoryAbortButton/>
            </Uploady>
        );
    });

export const WithAbort: UploadyStory = createUploadyStory(
    ({
         multiple,
         destination,
         enhancer,
         extOptions
     }): Node => {
        return (
            <div>
                <p>
                    Be prepared to click the abort button as soon as it appears once upload
                    begins
                </p>
                <Uploady
                    debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    {...extOptions}
                >
                    <ContextUploadButtonWithPrepareHooks {...extOptions} />
                    <StoryAbortButton/>
                </Uploady>
            </div>
        );
    });

export const WithConcurrent: UploadyStory = createUploadyStory(
    ({
         autoUpload,
         destination,
         enhancer,
         grouped,
         groupSize,
     }): Node => {
        return (
            <Uploady
                debug
                concurrent
                maxConcurrent={10}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
                autoUpload={autoUpload}
            >
                <p>Send concurrent uploads</p>
                <ContextUploadButton/>
                <br/>
                <ProcessPending/>
            </Uploady>
        );
    });

export const WithCustomResponseFormat: UploadyStory = createUploadyStory(
    ({
         autoUpload,
         destination,
         enhancer,
         grouped,
         groupSize,
     }): Node => {

        const resFormatter = useCallback(
            (res: Object, status: number, headers: Object) => {
                console.log(
                    "!!!!!! running custom server response formatter",
                    res,
                    status,
                    headers,
                );
                return `${status} - Yay!`;
            },
            [],
        );

        return (
            <Uploady
                debug
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
                autoUpload={autoUpload}
                formatServerResponse={resFormatter}
            >
                <ContextUploadButton/>
            </Uploady>
        );
    });

const UploadFormWithInternalInput = () => {
    const inputRef = useFileInput();

    const onSelectChange = useCallback((e: SyntheticKeyboardEvent<HTMLSelectElement>) => {
        if (e.currentTarget.value === "dir") {
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

export const WithExposedInternalInput: UploadyStory = createUploadyStory(
    ({
         autoUpload,
         destination,
         enhancer,
         grouped,
         groupSize,
     }): Node => {
        return (
            <Uploady
                debug
                concurrent
                maxConcurrent={10}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
                autoUpload={autoUpload}
            >
                <UploadFormWithInternalInput/>
            </Uploady>
        );
    });

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
                ...(window.__extPreSendOptions || {})
            }
        };
    });

    return namesLengths ? <p>{namesLengths}</p> : null;
};

export const WithHeaderFromFileName: UploadyStory = createUploadyStory(
    ({
         autoUpload,
         destination,
         enhancer,
         grouped,
         groupSize,
         extOptions,
     }): Node => {
        return (
            <Uploady
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
            </Uploady>
        );
    });

const isSuccessfulMockRequest = (xhr: XMLHttpRequest) => {
    console.log("CHECKING MOCK REQUEST - ", xhr);
    return false;
};

export const WithFailingMockSender: UploadyStory = createUploadyStory(
    ({ extOptions }): Node => {
        const { destination, enhancer } = mockDestination();

        return (
            <Uploady
                debug
                destination={destination}
                enhancer={addActionLogEnhancer(enhancer)}
                isSuccessfulCall={isSuccessfulMockRequest}
                {...extOptions}
            >
                <ContextUploadButton/>
            </Uploady>
        );
    });

//expose react and react-dom for Uploady bundle
window.react = React;
window["react-dom"] = ReactDOM;

//mimic rendering with react and react-uploady loaded through <script> tags
const renderUploadyFromBundle = ({
                                     destination,
                                     enhancer,
                                     multiple,
                                 }: UploadyStoryParams) => {
    const rpldy = window.rpldy,
        react = window.react;
    let result;

    try {
        const MyUploadButton = () => {
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
            destination,
            enhancer,
            multiple,
        };

        result = react.createElement(
            rpldy.Uploady,
            uploadyProps,
            [react.createElement(MyUploadButton)]
        );
    }
    catch (ex){
        result = react.createElement("p", { style: {"color": "red"}, children: `ERROR !!! ${ex.message}` });
    }

    return result;
};

export const UMD_CoreUI: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         multiple,
     }: UploadyStoryParams): Node => {
        const [UploadyUI, setUploadyUI] = useState(null);

        const onBundleLoad = useCallback(() => {
            const result = renderUploadyFromBundle({
                destination,
                enhancer,
                multiple,
            });

            setUploadyUI(result);
        }, [destination, enhancer, multiple]);

        return <div>
            <UmdBundleScript bundle={UMD_NAMES.CORE_UI} onLoad={onBundleLoad}/>

            {UploadyUI}
        </div>;
    });

//mimic rendering with react and react-uploady with UploadButton&UploadPreview loaded through <script> tags
const renderUploadyAll = ({
                              destination,
                              enhancer,
                              multiple,
                          }: UploadyStoryParams) => {
    const rpldy = window.rpldy, react = window.react;

    const uploadButton = react.createElement(rpldy.uploadButton.UploadButton, { id: "upload-button" });

    const uploadPreview = react.createElement(rpldy.uploadPreview.UploadPreview, {
        id: "upload-preview",
        previewComponentProps: { "data-test": "upload-preview", style: { maxWidth: "200px" } },
    });

    const uploadyProps = {
        debug: true,
        destination,
        multiple,
        enhancer,
    };

    const uploadUrlLog = react.createElement("div", { children: `about to upload to: ${uploadyProps.destination?.url || "no destination!"}` })

    return react.createElement(
        rpldy.uploady.Uploady,
        uploadyProps,
        [uploadUrlLog, uploadButton, uploadPreview]);
};

export const UMD_ALL: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         multiple,
     }): Node => {
        const [UploadyUI, setUploadyUI] = useState(null);

        const onBundleLoad = useCallback(() => {
            const result = renderUploadyAll({
                destination,
                enhancer,
                multiple,
            });
            setUploadyUI(result);
        }, [destination, enhancer, multiple]);

        return <div>
            <UmdBundleScript bundle={UMD_NAMES.ALL} onLoad={onBundleLoad}/>

            {UploadyUI}
        </div>;
    });

const UploadButtonWithInvalidPreSend = () => {
    useRequestPreSend(({ items }) => {
        // $FlowExpectedError[incompatible-call]
        return {
            items: items[0].id === "batch-1.item-1" ? [
                //intentionally cause error for the first upload since changing item id is forbidden
                { ...items[0], id: "invalid-id" },
                ...items.slice(1),
            ] : undefined,
        }
    });

    return <ContextUploadButton/>;
};

export const TEST_InvalidPreSend: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         multiple,
     }): Node => {
        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
            >
                <UploadButtonWithInvalidPreSend/>
            </Uploady>
        );
    });

const UploadButtonWithInvalidBatchStart = () => {
    useBatchStartListener((batch) => {
        return batch.id === "batch-1" ? {
            //$FlowExpectedError - intentionally cause error for the first batch since changing batch is forbidden
            batch: {}
        } : {};
    });

    useBatchErrorListener((batch) => {
        logToCypress("BATCH_ERROR", batch);
    });

    return <ContextUploadButton/>;
};

export const TEST_InvalidBatchStart: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         multiple,
     }): Node => {
        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
            >
                <UploadButtonWithInvalidBatchStart/>
            </Uploady>
        );
    });

const TEST_CancelOnBatchAdd_listeners = {
    [UPLOADER_EVENTS.BATCH_ADD]: (batch: Batch) => {
        return batch.items.length < 3;
    },
};

export const TEST_CancelOnBatchAdd: UploadyStory = createUploadyStory(
    ({
         autoUpload,
         destination,
         enhancer,
         grouped,
         groupSize,
     }): Node => {
        return (
            <Uploady
                enhancer={enhancer}
                destination={destination}
                grouped={grouped}
                maxGroupSize={groupSize}
                autoUpload={autoUpload}
                listeners={TEST_CancelOnBatchAdd_listeners}
                maxConcurrent={3}
                debug
            >
                <ContextUploadButton text="max 2 file upload"/>
            </Uploady>
        );
    });

const UploadyStories: CsfExport = getCsfExport(Uploady, "Uploady", Readme, {
    pkg: "uploady",
    section: "UI",
});

export default { ...UploadyStories, title: "UI/Uploady" };
