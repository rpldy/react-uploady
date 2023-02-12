// @flow
import React, { useState } from "react";
import UploadButton from "@rpldy/upload-button";
import { number, boolean } from "@storybook/addon-knobs";
import {
    DESTINATION_TYPES,
    getCsfExport,
    KNOB_GROUPS,
    useStoryUploadySetup,
    type CsfExport,
} from "../../../story-helpers";
import retryEnhancer, { useRetry, useRetryListener } from "@rpldy/retry-hooks";
import TusUploady,
{
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

const useTusStoryHelper = () => {
	const setup = useStoryUploadySetup({
		noGroup: true,
		destinations: [DESTINATION_TYPES.url, DESTINATION_TYPES.local],
		noLong: true,
	});

	const chunkSize = number("chunk size (bytes)", 524288, {}, KNOB_GROUPS.SETTINGS);
	const forgetOnSuccess = boolean("forget on success", false, KNOB_GROUPS.SETTINGS);
	const resume = boolean("enable resume (storage)", true, KNOB_GROUPS.SETTINGS);
	const ignoreModifiedDateInStorage = boolean("ignore modifiedDate in resume storage", false, KNOB_GROUPS.SETTINGS);
	const sendDataOnCreate = boolean("send data on create", false, KNOB_GROUPS.SETTINGS);
	const sendWithCustomHeader = boolean("send custom header", false, KNOB_GROUPS.SETTINGS);

	return {
		...setup,
		chunkSize,
		forgetOnSuccess,
		resume,
		ignoreModifiedDateInStorage,
		sendDataOnCreate,
		sendWithCustomHeader,
	};
};

const AbortButton = () => {
    const abortAll = useAbortAll();

    return <button id="abort-btn" onClick={abortAll}>Abort</button>;
};

const ItemProgress = () => {
    const [progress, setProgress] = useState<{ id: string, text: string }[]>([]);

    useItemProgressListener(({ id, batchId, loaded, completed }) => {
        setProgress((latest) => latest.concat({ id: batchId + id + loaded, text: `${id}: LOADED - ${loaded} - COMPLETED - ${completed}` }));
    });

    useItemAbortListener(({ id, batchId }) => {
        setProgress((latest) => latest.concat({ id: batchId + id + "_abort", text: `${id}: ABORT !!!!!! ----------` }));
    });

    return (
        <>
            {progress.map((p) => <p key={p.id} data-id={p.id}>{p.text}</p>)}
            <br/>
            <button onClick={() => setProgress([])}>clear progress</button>
        </>
    );
};

export const Simple = (): Node => {
	const storySetup = useTusStoryHelper();
	let { destination } = storySetup;
	const { enhancer, chunkSize, forgetOnSuccess, resume, ignoreModifiedDateInStorage, sendDataOnCreate, sendWithCustomHeader } = storySetup;

	if (sendWithCustomHeader) {
		destination = { ...destination, headers: { "x-test": "abcd" } };
	}

	return <TusUploady
		debug
		destination={destination}
		enhancer={enhancer}
		chunkSize={chunkSize}
		forgetOnSuccess={forgetOnSuccess}
		resume={resume}
		ignoreModifiedDateInStorage={ignoreModifiedDateInStorage}
		sendDataOnCreate={sendDataOnCreate}>
		<UploadButton id="upload-button">Upload with TUS</UploadButton>
        <br/>
        <AbortButton/>
        <ItemProgress/>
	</TusUploady>;
};

const DynamicUploadMeta = () => {
    useRequestPreSend(({ items }) => {
        const name = items[0].file.name;

        return {
            options: {
                params: {
                    "md-fileName": name,
                }
            }
        }
    });

    return null;
};

export const WithDynamicMetadata = (): Node => {
    const storySetup = useTusStoryHelper();
    let { destination } = storySetup;
    const { enhancer, chunkSize, forgetOnSuccess, resume, ignoreModifiedDateInStorage, sendDataOnCreate, sendWithCustomHeader } = storySetup;

    return <TusUploady
        debug
        destination={destination}
        enhancer={enhancer}
        chunkSize={chunkSize}
        forgetOnSuccess={forgetOnSuccess}
        resume={resume}
        ignoreModifiedDateInStorage={ignoreModifiedDateInStorage}
        sendDataOnCreate={sendDataOnCreate}>
        <UploadButton id="upload-button">Upload with TUS</UploadButton>
        <br/>
        <ItemProgress/>
        <DynamicUploadMeta/>
    </TusUploady>;
};

const TusConcatUploadLog = () => {
    const [log, setLog] = useState<string[]>([]);

    useItemStartListener(() => {
        setLog((log) => log.concat("ITEM STARTED UPLOADING..."));
    });

    useItemFinishListener(() => {
        setLog((log) => log.concat("ITEM FINISHED UPLOADING!"));
    });

    return (log.map((line) =>
        <p key={line}>{line}</p>));
};

export const WithTusConcatenation = (): Node => {
	const { enhancer, destination, chunkSize, forgetOnSuccess, resume, ignoreModifiedDateInStorage, sendDataOnCreate } = useTusStoryHelper();

	return <TusUploady
		debug
		destination={destination}
		enhancer={enhancer}
		chunkSize={chunkSize}
		forgetOnSuccess={forgetOnSuccess}
		resume={resume}
		parallel={2}
		ignoreModifiedDateInStorage={!ignoreModifiedDateInStorage}
		sendDataOnCreate={sendDataOnCreate}>
		<UploadButton>Upload with TUS Concatenation</UploadButton>
        <TusConcatUploadLog/>
	</TusUploady>;
};

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
        showRetry &&
        <button
            id="retry-tus-btn"
            onClick={() => retry()}
        >
            Retry TUS
        </button>
    );
};

export const WithRetry = (): Node => {
    const storySetup = useTusStoryHelper();
    let { destination } = storySetup;
    const { enhancer, chunkSize, forgetOnSuccess, resume, ignoreModifiedDateInStorage, sendDataOnCreate, sendWithCustomHeader } = storySetup;

    if (sendWithCustomHeader) {
        destination = { ...destination, headers: { "x-test": "abcd" } };
    }

    return <TusUploady
        debug
        destination={destination}
        enhancer={composeEnhancers(enhancer, retryEnhancer)}
        chunkSize={chunkSize}
        forgetOnSuccess={forgetOnSuccess}
        resume={resume}
        ignoreModifiedDateInStorage={ignoreModifiedDateInStorage}
        sendDataOnCreate={sendDataOnCreate}>
        <UploadButton id="upload-button">Upload with TUS</UploadButton>
        <br/>
        <AbortButton/>
        <RetryTus/>
        <ItemProgress/>
    </TusUploady>;
};

const ResumeHandler = ({ cancelResume = false }: { cancelResume: boolean }) => {
    useTusResumeStartListener(() => {
        return cancelResume ? false : {
            resumeHeaders: {
                "x-another-header": "foo",
                "x-test-override": "def"
            }
        }
    });

    return null;
};

export const WithResumeStartHandler = (): Node => {
    const storySetup = useTusStoryHelper();
    let { destination } = storySetup;
    const { enhancer, chunkSize, forgetOnSuccess, resume, ignoreModifiedDateInStorage, sendDataOnCreate, sendWithCustomHeader, extOptions } = storySetup;

    if (sendWithCustomHeader) {
        destination = { ...destination, headers: { "x-test": "abcd" } };
    }

    return <TusUploady
        debug
        destination={destination}
        enhancer={composeEnhancers(enhancer, retryEnhancer)}
        chunkSize={chunkSize}
        forgetOnSuccess={forgetOnSuccess}
        resume={resume}
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
    </TusUploady>;
};

export default (getCsfExport(TusUploady, "Tus Uploady", readme, { pkg: "tus-uploady", section: "UI" }): CsfExport);
