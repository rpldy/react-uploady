// @flow
import addLife from "@rupy/life-events";
import { BATCH_STATES } from "@rupy/shared";
import createBatch from "./batch";
import getProcessor from "./processor";
import { UPLOADER_EVENTS } from "./consts";
import { DEFAULT_OPTIONS } from "./defaults";
import triggerCancellable from "./triggerCancellable";

import type {
	UploaderType,
	UploadInfo,
	// Destination,
	AddOptions,
	CreateOptions,
	UploaderEnhancer,
} from "@rupy/shared";

const EVENT_NAMES = Object.values(UPLOADER_EVENTS);

let counter = 0;

export default (options: ?CreateOptions, enhancer: UploaderEnhancer): UploaderType => {
	counter += 1;

	const pendingUploads = [];

	console.log("!!!!!!!!!!!! CREATING UPLOADER !!!!!!!!! ", { options, enhancer, counter });

	options = options ? { ...options } : { ...DEFAULT_OPTIONS };

	const update = (updateOptions: CreateOptions) => {
		options = updateOptions;
	};

	const add = async (files: UploadInfo[], addOptions: AddOptions): Promise<void> => {
		const batch = createBatch(files, uploader.id);

		const isCancelled = await cancellable(UPLOADER_EVENTS.BATCH_ADD, batch);

		if (!isCancelled) {
			const processOptions = {
				...options,
				...addOptions
			};

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

	const abort = (): void => {

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

	let uploader = {
		id: `uploader-${counter}`,
		update,
		add,
		upload,
		abort,
	};

	// const instance = {
	// 	base: uploader,
	// 	...uploader,
	// 	// ...overrides
	// };

	const { trigger } = addLife(
		uploader,
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