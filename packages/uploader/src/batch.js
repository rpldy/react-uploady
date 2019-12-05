// @flow
import { BATCH_STATES, FILE_STATES } from "@rupy/shared";
import isString from "lodash/isString";
import isObjectLike from "lodash/isObjectLike"
import type {
	UploadInfo,
	BatchItem,
	Batch,
	// BatchState,
	// AddOptions
} from "@rupy/shared";

let bCounter = 0,
	fCounter = 0;

const noOp = () => {
};

const getBatchItemWithUrl = (batchItem: Object, url: string): BatchItem => {
	batchItem.url = url;
	return batchItem;
};

const getBatchItemWithFile = (batchItem: Object, file: Object): BatchItem => {
	batchItem.file = file;
	return batchItem;
};


const processFiles = (batchId, files: UploadInfo): BatchItem[] =>
	Array.prototype.map.call(files, (f: UploadInfo): BatchItem => {
		fCounter += 1;
		const id = `${batchId}.file-${fCounter}`;
		const state = FILE_STATES.ADDED;

		let batchItem = {
			id,
			batchId,
			state,
			abort: noOp,
			completed: 0,
			loaded: 0,
		};

		if (isString(f)) {
			batchItem = getBatchItemWithUrl(batchItem, f);
			// (batchItem: BatchItem).url = f;
		} else if (isObjectLike(f)) {
			batchItem = getBatchItemWithFile(batchItem, f);
			//(batchItem: BatchItem).file = f;
		} else {
			throw new Error(`Unknown type of file added: ${typeof (f)}`);
		}

		return batchItem;
	});

export default (files: UploadInfo | UploadInfo[], uploaderId: string): Batch => {
	bCounter += 1;
	const id = `batch-${bCounter}`;

	files = Array.isArray(files) ? files : [files];
	
	return {
		id,
		uploaderId,
		items: processFiles(id, files),
		state: BATCH_STATES.ADDED,
	};
};