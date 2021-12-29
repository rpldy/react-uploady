// @flow
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { createRequestUpdateHoc } from "./createRequestUpdateHoc";

import type { BatchItem, Batch } from "@rpldy/shared";
import type { CreateOptions } from "@rpldy/uploader";
import type { RequestUpdateHoc } from "./createRequestUpdateHoc";

type BatchStartRequestData = { batch: Batch, items: BatchItem[], options: CreateOptions };

const withBatchStartUpdate: RequestUpdateHoc = createRequestUpdateHoc<BatchStartRequestData>({
    eventType: UPLOADER_EVENTS.BATCH_START,
    getIsValidEventData: (id, batch: Batch) => batch.id === id,
    getRequestData: (batch, batchOptions) =>
        ({ batch, items: batch.items, options: batchOptions }),
});

export default withBatchStartUpdate;
