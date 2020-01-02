// @flow
import triggerCancellable from "./triggerCancellable";
import createUploadQueue from "./queue";
import createItemsSender from "./batchItemsSender";

import type { TriggerMethod } from "@rpldy/life-events";
import type { Batch, CreateOptions } from "@rpldy/shared";
import type { Cancellable } from "./types";
//TODO: need a way to augment batch data at any point !!!!!!!!!

//TODO: implement processing pipeline
//TODO: ex: preview


export default (trigger: TriggerMethod, options: CreateOptions, uploaderId: string) => {
	// $FlowFixMe - https://github.com/facebook/flow/issues/8215
	const cancellable: Cancellable = triggerCancellable(trigger);
	const sender = createItemsSender();
	const queue = createUploadQueue(options, cancellable, trigger, sender, uploaderId);

	const process = (batch: Batch, batchOptions: CreateOptions) => {
		queue.uploadBatch(batch, batchOptions);
	};

	return {
		process,
	};
};