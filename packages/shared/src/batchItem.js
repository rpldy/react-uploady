// @flow
import { isString, isObjectLike, } from "lodash";
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

	if (isString(f)) {
		batchItem = getBatchItemWithUrl(batchItem, f);
	} else if (isObjectLike(f)) {
		batchItem = getBatchItemWithFile(batchItem, f);
	} else {
		throw new Error(`Unknown type of file added: ${typeof (f)}`);
	}

	return batchItem;
};