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
import TusUploady,
{
    useAbortAll,
    useItemProgressListener,
    useItemStartListener,
    useItemFinishListener,
} from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

import type { Node } from "React";

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

    return <button onClick={abortAll}>Abort</button>;
};

const ItemProgress = () => {
    const [progress, setProgress] = useState([]);
    useItemProgressListener(({ id, loaded, completed }) => {
        setProgress((latest) => latest.concat(`${id}: LOADED - ${loaded} - COMPLETED - ${completed}`));
    });

    return progress.map((p) => <p key={p}>{p}</p>);
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

const TusConcatUploadLog = () => {
    const [log, setLog] = useState([]);

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

export default (getCsfExport(TusUploady, "Tus Uploady", readme): CsfExport);
