// @flow
import { triggerCancellable } from "@rpldy/shared";
import createUploadQueue from "./queue";
import createItemsSender from "./batchItemsSender";

import type { TriggerMethod } from "@rpldy/life-events";
import type { Batch, Cancellable } from "@rpldy/shared";
import type { CreateOptions } from "./types";

export default (trigger: TriggerMethod, options: CreateOptions, uploaderId: string) => {
    // $FlowFixMe - https://github.com/facebook/flow/issues/8215
    const cancellable: Cancellable = triggerCancellable(trigger),
        sender = createItemsSender(),
        queue = createUploadQueue(options, cancellable, trigger, sender, uploaderId);

    const process = (batch: Batch, batchOptions: CreateOptions) => {
        queue.uploadBatch(batch, batchOptions);
    };

    const abortBatch = (batchId: string) => {
        queue.abortBatch(batchId);
    };

	const abort = (id?: string) => {
		if (id){
			queue.abortItem(id);
		}
		else{
			queue.abortAll();
		}
	};

    return {
        process,
        abortBatch,
        abort,
    };
};
