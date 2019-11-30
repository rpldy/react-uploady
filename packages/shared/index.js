// @flow

import { BATCH_STATES, FILE_STATES } from "./src/consts";
import * as logger from "./src/logger";

import type {
	CreateOptions,
	Destination,
	UploadOptions,
	UploadInfo,
	ProgressInfo,
	BatchState,
	FileState,
	NonMaybeTypeFunc,
} from "./types";

export {
	BATCH_STATES,
	FILE_STATES,

	logger,
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
};
