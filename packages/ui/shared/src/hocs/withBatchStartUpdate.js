// @flow
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { createRequestUpdateHoc, type RequestUpdateHoc } from "./createRequestUpdateHoc";

const withBatchStartUpdate: RequestUpdateHoc = createRequestUpdateHoc(
    UPLOADER_EVENTS.BATCH_START,
    (id, batch) => (batch.id === id),
    (batch, options) => ({ items: batch.items, options, batch }),
);

export default withBatchStartUpdate;
