// @flow

import { BATCH_STATES, FILE_STATES } from "./src/consts";
import * as logger from "./src/logger";

import type {
	CreateOptions,
	UploaderType,
	Destination,
	UploadOptions,
	UploadInfo,
	ProgressInfo,
	BatchState,
	FileState,
	UploaderEnhancer,
	NonMaybeTypeFunc,
} from "./types";

export {
	BATCH_STATES,
	FILE_STATES,

	logger,
};

export type {
	UploaderType,
	CreateOptions,
	Destination,
	// AddOptions,
	UploadOptions,
	UploadInfo,
	ProgressInfo,
	BatchState,
	FileState,
	UploaderEnhancer,
	NonMaybeTypeFunc,
};
