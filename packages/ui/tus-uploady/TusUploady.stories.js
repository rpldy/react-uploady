// @flow
import React, { useState } from "react";
import UploadButton from "@rpldy/upload-button";
import {
    DEFAULT_CHUNK_SIZE,
    getCsfExport,
    createUploadyStory,
    getTusDestinationOptions,
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
} from "./src";

import readme from "./README.md";
import type { Node } from "react";

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
            {progress.map((p) => (
                <p key={p.id} data-id={p.id}>
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
     }): Node => {
        const activeDestination = sendWithCustomHeader ?
            { ...destination, headers: { "x-test": "abcd" } } :
            destination

        return (
            <TusUploady
                debug
                destination={activeDestination}
                enhancer={enhancer}
                chunkSize={chunkSize}
                forgetOnSuccess={forgetOnSuccess}
                resume={resumeStorage}
                ignoreModifiedDateInStorage={ignoreModifiedDateInStorage}
                sendDataOnCreate={sendDataOnCreate}
            >
                <UploadButton id="upload-button">Upload with TUS</UploadButton>
                <br/>
                <AbortButton/>
                <ItemProgress/>
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
     }): Node => {
        return (
            <TusUploady
                debug
                destination={destination}
                enhancer={enhancer}
                chunkSize={chunkSize}
                forgetOnSuccess={forgetOnSuccess}
                resume={resumeStorage}
                ignoreModifiedDateInStorage={ignoreModifiedDateInStorage}
                sendDataOnCreate={sendDataOnCreate}
            >
                <UploadButton id="upload-button">Upload with TUS</UploadButton>
                <br/>
                <ItemProgress/>
                <DynamicUploadMeta/>
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

    return log.map((line) => <p key={line}>{line}</p>);
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
     }): Node => {
        return (
            <TusUploady
                debug
                destination={destination}
                enhancer={enhancer}
                chunkSize={chunkSize}
                forgetOnSuccess={forgetOnSuccess}
                resume={resumeStorage}
                parallel={2}
                ignoreModifiedDateInStorage={!ignoreModifiedDateInStorage}
                sendDataOnCreate={sendDataOnCreate}
            >
                <UploadButton>Upload with TUS Concatenation</UploadButton>
                <TusConcatUploadLog/>
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
         forgetOnSuccess,
         resumeStorage,
         ignoreModifiedDateInStorage,
         sendDataOnCreate,
         sendWithCustomHeader,
     }): Node => {
        const activeDestination = sendWithCustomHeader ?
            { ...destination, headers: { "x-test": "abcd" } } :
            destination;

        return (
            <TusUploady
                debug
                destination={activeDestination}
                enhancer={composeEnhancers(enhancer, retryEnhancer)}
                chunkSize={chunkSize}
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
                chunkSize={chunkSize}
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
            </TusUploady>
        );
    });

const tusUploadyStories: CsfExport = getCsfExport(TusUploady, "Tus Uploady", readme, {
    pkg: "tus-uploady",
    section: "UI",
    parameters: {
        controls: {
            exclude: ["group", "longLocal"],
        }
    },
    args: {
        uploadType: "url",
        chunkSize: DEFAULT_CHUNK_SIZE,
        forgetOnSuccess: false,
        resumeStorage: true,
        ignoreModifiedDateInStorage: false,
        sendDataOnCreate: false,
        sendWithCustomHeader: false,
    },
    argTypes: {
        uploadType: {
            control: "radio",
            options: getTusDestinationOptions(),
        },
        chunkSize: { control: "number" },
        forgetOnSuccess: { control: "boolean" },
        resumeStorage: { control: "boolean" },
        ignoreModifiedDateInStorage: { control: "boolean" },
        sendDataOnCreate: { control: "boolean" },
        sendWithCustomHeader: { control: "boolean" },
    }
});

export default { ...tusUploadyStories, title: "UI/Tus Uploady" };
