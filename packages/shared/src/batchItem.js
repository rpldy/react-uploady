// @flow
import { FILE_STATES } from "./consts";
import type { BatchItem, UploadInfo } from "./types";

let iCounter = 0;

const getBatchItemWithUrl = (batchItem: Object, url: string): BatchItem => {
	batchItem.url = url;
	return batchItem;
};

const getBatchItemWithFile = (batchItem: Object, file: Object): BatchItem => {
	batchItem.file = file;
	return batchItem;
};

const isLikeFile = (f: UploadInfo) => f && typeof f === "object" && f.name;

export default (f: UploadInfo, batchId: string): BatchItem => {
	iCounter += 1;
	const id = `${batchId}.item-${iCounter}`,
		state = FILE_STATES.ADDED;

	let batchItem = {
		id,
		batchId,
		state,
		completed: 0,
		loaded: 0,
		aborted: false,
	};

	if (typeof f === "string") {
		batchItem = getBatchItemWithUrl(batchItem, f);
	} else if (isLikeFile(f)) {
		batchItem = getBatchItemWithFile(batchItem, f);
	} else {
		throw new Error(`Unknown type of file added: ${typeof (f)}`);
	}

	return batchItem;
};
