// @flow
import { BATCH_STATES, FILE_STATES } from "@rupy/shared";
import isString from "lodash/isString";
import isObjectLike from "lodash/isObjectLike"
import type {
	UploadInfo,
	// BatchState,
	// AddOptions
} from "@rupy/shared";

import type { Batch, BatchItem } from "../types";

let bCounter = 0,
	fCounter = 0;

const processFiles = (batchId, files: UploadInfo): BatchItem[] =>
	Array.prototype.map.call(files, (f: UploadInfo): BatchItem => {
		fCounter += 1;
		const id = `${batchId}.file-${fCounter}`;
		const state = FILE_STATES.ADDED;

		if (isString(f)) {
			f = {
				id,
				batchId,
				state,
				url: f
			}
		} else if (isObjectLike(f)) {
			f = {
				id,
				batchId,
				state,
				file: f,
			};
		} else {
			throw new Error(`Unknown type of file added: ${typeof (f)}`);
		}

		return f;
	});

export default (files: UploadInfo[], uploaderId: string): Batch => {
	bCounter += 1;
	const id = `batch-${bCounter}`;

	return {
		id,
		uploaderId,
		items: processFiles(id, files),
		state: BATCH_STATES.ADDED,
	};
};