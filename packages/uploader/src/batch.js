// @flow
import { BATCH_STATES, createBatchItem } from "@rpldy/shared";

import type {
	UploadInfo,
	BatchItem,
	Batch,
} from "@rpldy/shared";

let bCounter = 0;

const processFiles = (batchId, files: UploadInfo): BatchItem[] =>
	Array.prototype.map.call(files, (f) => createBatchItem(f, batchId));

export default (files: UploadInfo | UploadInfo[], uploaderId: string): Batch => {
	bCounter += 1;
	const id = `batch-${bCounter}`;

	files = (Array.isArray(files) || files instanceof FileList) ? files : [files];

	return {
		id,
		uploaderId,
		items: processFiles(id, files),
		state: BATCH_STATES.ADDED,
	};
};