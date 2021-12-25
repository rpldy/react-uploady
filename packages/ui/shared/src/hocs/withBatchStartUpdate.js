// @flow
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { createRequestUpdateHoc, type RequestUpdateHoc } from "./createRequestUpdateHoc";

const withBatchStartUpdate: RequestUpdateHoc<{}> = createRequestUpdateHoc<{}>(
    UPLOADER_EVENTS.BATCH_START,
    true,
    (id, batch) => !!batch?.id,
    (batch, options) => ({ batch, items: batch.items, options }),
);

export default withBatchStartUpdate;
