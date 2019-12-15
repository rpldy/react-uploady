// @flow

import { BATCH_STATES, FILE_STATES } from "./consts";
import * as logger from "./logger";
import { isFunction } from "./utils";

import type {
	UploadOptions,
	CreateOptions,
	Destination,
	UploadInfo,
	ProgressInfo,
	BatchState,
	FileState,
	NonMaybeTypeFunc,
	Batch,
	BatchItem,
	SendMethod,
	SendResult,
	UploadData,
	OnProgress,
	SendOptions,
	SenderProgressEvent,
} from "./types";

export {
	BATCH_STATES,
	FILE_STATES,

	logger,
	isFunction,
};

export type {
	UploadOptions,
	CreateOptions,
	Destination,
	UploadInfo,
	ProgressInfo,
	BatchState,
	FileState,
	NonMaybeTypeFunc,
	Batch,
	BatchItem,
	SendMethod,
	SendResult,
	UploadData,
	OnProgress,
	SendOptions,
	SenderProgressEvent,
};
