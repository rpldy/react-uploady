// @flow
import { cloneDeep, merge } from "lodash";
import addLife from "@rupy/life-events";
import { BATCH_STATES, logger } from "@rupy/shared";
import createBatch from "./batch";
import getProcessor from "./processor";
import { UPLOADER_EVENTS } from "./consts";
import triggerCancellable from "./triggerCancellable";

import type {
	UploadInfo,
	UploadOptions,
	CreateOptions,
} from "@rupy/shared";

import type  {
	UploaderType,
	UploaderEnhancer,
} from "../types";

import { getMandatoryOptions } from "./utils";
import type { MandatoryCreateOptions } from "../types";

const EVENT_NAMES = Object.values(UPLOADER_EVENTS);

let counter = 0;

export default (options?: CreateOptions, enhancer?: UploaderEnhancer): UploaderType => {
	counter += 1;

	const pendingUploads = [];

	logger.debugLog("uploady.uploader: creating new instance", { options, enhancer, counter });

	options = getMandatoryOptions(options);

	const update = (updateOptions: CreateOptions) => {

		//TODO: updating concurrent and maxConcurrent means we need to update the processor!!!!!

		options = merge({}, options, updateOptions); //need deep merge for destination
	};

	const add = async (files: UploadInfo | UploadInfo[], addOptions: UploadOptions): Promise<void> => {
		const batch = createBatch(files, uploader.id);

		// $FlowFixMe - https://github.com/facebook/flow/issues/8215
		const isCancelled = await cancellable(UPLOADER_EVENTS.BATCH_ADD, batch);

		if (!isCancelled) {
			const processOptions = merge({}, options, addOptions);

			if (processOptions.autoUpload) {
				processor.process(batch, processOptions)
			} else {
				pendingUploads.push({ batch, processOptions });
			}
		} else {
			batch.state = BATCH_STATES.CANCELLED;
			trigger(UPLOADER_EVENTS.BATCH_CANCEL, batch);
		}
	};

	const abort = (id?: string): void => {

		//need access to processor queue

		//TODO: implement abort

	};

	/**
	 * Tells the uploader to process batches that weren't auto-uploaded
	 */
	const upload = (): void => {
		pendingUploads
			.splice(0)
			.forEach(({ batch, processOptions }) =>
				processor.process(batch, processOptions));
	};

	const getOptions = (): MandatoryCreateOptions => {
		return cloneDeep(options);
	};

	let { trigger, target: uploader } = addLife(
		{
			id: `uploader-${counter}`,
			update,
			add,
			upload,
			abort,
			getOptions,
		},
		EVENT_NAMES,
		{ canAddEvents: false, canRemoveEvents: false }
	);

	const cancellable = triggerCancellable(trigger);

	if (enhancer) {
		uploader = enhancer(uploader, trigger);
	}

	const processor = getProcessor(trigger, options);

	return uploader;
}