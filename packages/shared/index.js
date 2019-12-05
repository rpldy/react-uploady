// @flow

import { BATCH_STATES, FILE_STATES } from "./src/consts";
import * as logger from "./src/logger";
import * as utils from "./src/utils";

import type {
	CreateOptions,
	Destination,
	UploadOptions,
	UploadInfo,
	ProgressInfo,
	BatchState,
	FileState,
	NonMaybeTypeFunc,
	Batch,
	BatchItem,
} from "./types";

export {
	BATCH_STATES,
	FILE_STATES,

	logger,
	utils,
};

export type {
	CreateOptions,
	Destination,
	UploadOptions,
	UploadInfo,
	ProgressInfo,
	BatchState,
	FileState,
	NonMaybeTypeFunc,
	Batch,
	BatchItem,
};
