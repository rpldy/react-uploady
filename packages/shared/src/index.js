// @flow

import { BATCH_STATES, FILE_STATES } from "./consts";
import * as logger from "./logger";
import { isFunction, isSamePropInArrays } from "./utils";
import triggerCancellable from "./triggerCancellable";
import triggerUpdater from "./triggerUpdater";

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
	Trigger,
	Cancellable,
	Updater
} from "./types";

export {
	BATCH_STATES,
	FILE_STATES,

	logger,
	isFunction,
	isSamePropInArrays,

	triggerCancellable,
	triggerUpdater,
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
	Trigger,
	Cancellable,
	Updater
};
