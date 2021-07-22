// @flow
import { FILE_STATES } from "./consts";
import type { BatchItem, UploadInfo } from "./types";

const BISYM = Symbol.for("__rpldy-bi__");

let iCounter = 0;

const getBatchItemWithUrl = (batchItem: Object, url: string): BatchItem => {
	batchItem.url = url;
	return batchItem;
};

const getBatchItemWithFile = (batchItem: Object, file: Object): BatchItem => {
	batchItem.file = file;
	return batchItem;
};

const isLikeFile = (f: UploadInfo) => f && (f instanceof File || f instanceof Blob || (typeof f === "object" && f.name && f.type));

export default (f: UploadInfo, batchId: string, isPending: boolean = false): BatchItem => {
    iCounter += (f.id && f.batchId) ? 0 : 1;

	//keep existing id for recycled items
	const id = (f.id && f.batchId) ? f.id : `${batchId}.item-${iCounter}`,
        state = isPending ? FILE_STATES.PENDING : FILE_STATES.ADDED;

    let batchItem = {
		id,
		batchId,
		state,
        uploadStatus: 0,
		completed: 0,
		loaded: 0,
		aborted: false,
		recycled: false,
        previousBatch: null,
	};

	Object.defineProperty(batchItem, BISYM, {
		value: true,
		//need writable to be able to keep prop when unwrapped from simple-state
		writable: true,
	});

	if (typeof f === "object" && f[BISYM] === true) {
		//recycling existing batch item
		batchItem.recycled = true;
		batchItem.previousBatch = f.batchId;
		f = f.file || f.url;
	}

	if (typeof f === "string") {
		batchItem = getBatchItemWithUrl(batchItem, f);
	} else if (isLikeFile(f)) {
		batchItem = getBatchItemWithFile(batchItem, f);
	} else {
		throw new Error(`Unknown type of file added: ${typeof (f)}`);
	}

	return batchItem;
};
