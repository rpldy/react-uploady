// @flow
import React, { useState } from "react";
import UploadButton from "@rpldy/upload-button";
import {
    getCsfExport,
    createUploadyStory,
    getTusStoryArgs,
    type CsfExport,
    type UploadyStory,
} from "../../../story-helpers";
import retryEnhancer, { useRetry, useRetryListener } from "@rpldy/retry-hooks";
import TusUploady, {
    useAbortAll,
    useItemProgressListener,
    useItemStartListener,
    useItemFinishListener,
    useItemAbortListener,
    useItemErrorListener,
    useRequestPreSend,
    composeEnhancers,
    useTusResumeStartListener,
    useClearResumableStore,
} from "./src";

import Readme from "./TusUploady.storydoc.mdx";
import type { Node } from "react";

const ClearResumablesButton = () => {
    const clear = useClearResumableStore();
    return <button style={{ margin: "10px 0 10px"}} onClick={clear}>Clear Resumable Store</button>
};

const AbortButton = () => {
    const abortAll = useAbortAll();

    return (
        <button id="abort-btn" onClick={abortAll}>
            Abort
        </button>
    );
};

const ItemProgress = () => {
    const [progress, setProgress] = useState<{ id: string, text: string }[]>([]);

    useItemProgressListener(({ id, batchId, loaded, completed }) => {
        setProgress((latest) =>
            latest.concat({
                id: batchId + id + loaded,
                text: `${id}: LOADED - ${loaded} - COMPLETED - ${completed}`,
            }),
        );
    });

    useItemAbortListener(({ id, batchId }) => {
        setProgress((latest) =>
            latest.concat({
                id: batchId + id + "_abort",
                text: `${id}: ABORT !!!!!! ----------`,
            }),
        );
    });

    return (
        <>
            {progress.map((p, i) => (
                <p key={p.id + i} data-id={p.id}>
                    {p.text}
                </p>
            ))}
            <br/>
            <button onClick={() => setProgress([])}>clear progress</button>
        </>
    );
};

export const Simple: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         chunkSize,
         forgetOnSuccess,
         resumeStorage,
         ignoreModifiedDateInStorage,
         sendDataOnCreate,
         sendWithCustomHeader,
         parallel,
         extOptions,
     }): Node => {
        const activeDestination = sendWithCustomHeader ?
            { ...destination, headers: { "x-test": "abcd" } } :
            destination

        return (
            <TusUploady
                debug
                destination={activeDestination}
                enhancer={enhancer}
                chunkSize={extOptions?.chunkSize || chunkSize}
                parallel={extOptions?.parallel ?? parallel}
                forgetOnSuccess={forgetOnSuccess}
                resume={resumeStorage}
                ignoreModifiedDateInStorage={ignoreModifiedDateInStorage}
                sendDataOnCreate={sendDataOnCreate}
            >
                <UploadButton id="upload-button">Upload with TUS</UploadButton>
                <br/>
                <AbortButton/>
                <ItemProgress/>
                <ClearResumablesButton/>
            </TusUploady>
        );
    });

const DynamicUploadMeta = () => {
    useRequestPreSend(({ items }) => {
        const name = items[0].file.name;

        return {
            options: {
                params: {
                    "md-fileName": name,
                },
            },
        };
    });

    return null;
};

export const WithDynamicMetadata: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         chunkSize,
         forgetOnSuccess,
         resumeStorage,
         ignoreModifiedDateInStorage,
         sendDataOnCreate,
        extOptions,
     }): Node => {
        return (
            <TusUploady
                debug
                destination={destination}
                enhancer={enhancer}
                chunkSize={extOptions?.chunkSize || chunkSize}
                forgetOnSuccess={forgetOnSuccess}
                resume={resumeStorage}
                ignoreModifiedDateInStorage={ignoreModifiedDateInStorage}
                sendDataOnCreate={sendDataOnCreate}
            >
                <UploadButton id="upload-button">Upload with TUS</UploadButton>
                <br/>
                <ItemProgress/>
                <DynamicUploadMeta/>
                <ClearResumablesButton/>
            </TusUploady>
        );
    });

const TusConcatUploadLog = () => {
    const [log, setLog] = useState<string[]>([]);

    useItemStartListener(() => {
        setLog((log) => log.concat("ITEM STARTED UPLOADING..."));
    });

    useItemFinishListener(() => {
        setLog((log) => log.concat("ITEM FINISHED UPLOADING!"));
    });

    return log.map((line, i) => <p key={line + `${i}`}>{line}</p>);
};

export const WithTusConcatenation: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         chunkSize,
         forgetOnSuccess,
         resumeStorage,
         ignoreModifiedDateInStorage,
         sendDataOnCreate,
         parallel,
         extOptions
     }): Node => {
        return (
            <TusUploady
                debug
                destination={destination}
                enhancer={enhancer}
                chunkSize={extOptions?.chunkSize || chunkSize}
                forgetOnSuccess={forgetOnSuccess}
                resume={resumeStorage}
                parallel={extOptions?.parallel ?? (parallel || 2)}
                ignoreModifiedDateInStorage={!ignoreModifiedDateInStorage}
                sendDataOnCreate={sendDataOnCreate}
            >
                <UploadButton id="upload-button">Upload with TUS Concatenation</UploadButton>
                <TusConcatUploadLog/>
                <ClearResumablesButton/>
            </TusUploady>
        );
    });

const RetryTus = () => {
    const retry = useRetry();
    const [showRetry, setShowRetry] = useState(false);

    useItemAbortListener(() => {
        setShowRetry(true);
    });

    useItemErrorListener(() => {
        setShowRetry(true);
    });

    useRetryListener((items) => {
        console.log("RETRYING ITEMS - ", items);
    });

    return (
        showRetry && (
            <button id="retry-tus-btn" onClick={() => retry()}>
                Retry TUS
            </button>
        )
    );
};

export const WithRetry: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         chunkSize,
         parallel,
         forgetOnSuccess,
         resumeStorage,
         ignoreModifiedDateInStorage,
         sendDataOnCreate,
         sendWithCustomHeader,
         extOptions,
     }): Node => {
        const activeDestination = sendWithCustomHeader ?
            { ...destination, headers: { "x-test": "abcd" } } :
            destination;

        return (
            <TusUploady
                debug
                destination={activeDestination}
                enhancer={composeEnhancers(enhancer, retryEnhancer)}
                chunkSize={extOptions?.chunkSize || chunkSize}
                parallel={extOptions?.parallel ?? parallel}
                forgetOnSuccess={forgetOnSuccess}
                resume={resumeStorage}
                ignoreModifiedDateInStorage={ignoreModifiedDateInStorage}
                sendDataOnCreate={sendDataOnCreate}
            >
                <UploadButton id="upload-button">Upload with TUS</UploadButton>
                <br/>
                <AbortButton/>
                <RetryTus/>
                <ItemProgress/>
                <ClearResumablesButton/>
            </TusUploady>
        );
    });

const ResumeHandler = ({ cancelResume = false }: { cancelResume: boolean }) => {
    useTusResumeStartListener(() => {
        return cancelResume ? false : {
                resumeHeaders: {
                    "x-another-header": "foo",
                    "x-test-override": "def",
                },
            };
    });

    return null;
};

export const WithResumeStartHandler: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         chunkSize,
         parallel,
         forgetOnSuccess,
         resumeStorage,
         ignoreModifiedDateInStorage,
         sendDataOnCreate,
         sendWithCustomHeader,
         extOptions,
     }): Node => {
        const activeDestination = sendWithCustomHeader ?
            { ...destination, headers: { "x-test": "abcd" } } :
            destination;
        return (
            <TusUploady
                debug
                destination={activeDestination}
                enhancer={composeEnhancers(enhancer, retryEnhancer)}
                chunkSize={extOptions?.chunkSize || chunkSize}
                parallel={extOptions?.parallel ?? parallel}
                forgetOnSuccess={forgetOnSuccess}
                resume={resumeStorage}
                ignoreModifiedDateInStorage={ignoreModifiedDateInStorage}
                sendDataOnCreate={sendDataOnCreate}
                resumeHeaders={{
                    "x-test-resume": "123",
                    "x-test-override": "abc",
                }}
            >
                <UploadButton id="upload-button">Upload with TUS</UploadButton>
                <br/>
                <AbortButton/>
                <RetryTus/>
                <ItemProgress/>
                <ResumeHandler cancelResume={extOptions?.tusCancelResume}/>
                <ClearResumablesButton/>
            </TusUploady>
        );
    });

const tusUploadyStories: CsfExport = getCsfExport(TusUploady, "Tus Uploady", Readme, {
    pkg: "tus-uploady",
    section: "UI",
    ...getTusStoryArgs(),
});

export default { ...tusUploadyStories, title: "UI/Tus Uploady" };
