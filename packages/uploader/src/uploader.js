// @flow
import { cloneDeep, merge } from "lodash";
import addLife from "@rpldy/life-events";
import {
	BATCH_STATES,
	logger,
	triggerCancellable,
} from "@rpldy/shared";
import createBatch from "./batch";
import getProcessor from "./processor";
import { UPLOADER_EVENTS } from "./consts";
import { getMandatoryOptions } from "./utils";

import type {
	UploadInfo,
	UploadOptions,
	CreateOptions,
} from "@rpldy/shared";

import type  {
	UploaderType,
	UploaderEnhancer,
	PendingBatch,
} from "./types";

const EVENT_NAMES = Object.values(UPLOADER_EVENTS);

let counter = 0;

export default (options?: CreateOptions, enhancer?: UploaderEnhancer): UploaderType => {
	counter += 1;

	const pendingBatches = [];

	options = options || {};

	logger.debugLog("uploady.uploader: creating new instance", { options, enhancer, counter });

	let uploaderOptions: CreateOptions = getMandatoryOptions(options);

	const update = (updateOptions: CreateOptions) => {

		//TODO: updating concurrent and maxConcurrent means we need to update the processor!!!!!

		uploaderOptions = merge({}, uploaderOptions, updateOptions); //need deep merge for destination
		return uploader;
	};

	const add = async (files: UploadInfo | UploadInfo[], addOptions?: UploadOptions): Promise<void> => {
		const batch = createBatch(files, uploader.id);

		// $FlowFixMe - https://github.com/facebook/flow/issues/8215
		const isCancelled = await cancellable(UPLOADER_EVENTS.BATCH_ADD, batch);

		if (!isCancelled) {
			const processOptions: CreateOptions = merge({}, uploaderOptions, addOptions);

			if (processOptions.autoUpload) {
				processor.process(batch, processOptions);
			} else {
				pendingBatches.push({ batch, uploadOptions: processOptions });
			}
		} else {
			batch.state = BATCH_STATES.CANCELLED;
			trigger(UPLOADER_EVENTS.BATCH_CANCEL, batch);
		}
	};

	const abort = (id?: string): void => {
		processor.abort(id);
	};

	const abortBatch = (id: string): void => {
		processor.abortBatch(id);
	};

	const getPending = (): PendingBatch[] => {
		return pendingBatches.slice();
	};

	const clearPending = (): void => {
		pendingBatches.splice(0);
	};

	/**
	 * Tells the uploader to process batches that weren't auto-uploaded
	 */
	const upload = (): void => {
		pendingBatches
			.splice(0)
			.forEach(({ batch, uploadOptions }: PendingBatch) =>
				processor.process(batch, uploadOptions));
	};

	const getOptions = (): CreateOptions => {
		return cloneDeep(uploaderOptions);
	};

	let { trigger, target: uploader } = addLife(
		{
			id: `uploader-${counter}`,
			update,
			add,
			upload,
			abort,
			abortBatch,
			getOptions,
			getPending,
			clearPending,
		},
		EVENT_NAMES,
		{ canAddEvents: false, canRemoveEvents: false }
	);

	const cancellable = triggerCancellable(trigger);

	if (enhancer) {
		const enhanced = enhancer(uploader, trigger);
		uploader = enhanced || uploader;
	}

	const processor = getProcessor(trigger, uploaderOptions, uploader.id);

	return uploader;
};