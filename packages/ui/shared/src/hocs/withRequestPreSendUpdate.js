// @flow
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { createRequestUpdateHoc } from "./createRequestUpdateHoc";

import type { BatchItem } from "@rpldy/shared";
import type { UploaderCreateOptions } from "@rpldy/uploader";
import type { RequestUpdateHoc } from "./createRequestUpdateHoc";

type PreSendRequestData = { items: BatchItem[], options: UploaderCreateOptions };

const withRequestPreSendUpdate: RequestUpdateHoc = createRequestUpdateHoc<PreSendRequestData>({
    eventType: UPLOADER_EVENTS.REQUEST_PRE_SEND,
    getIsValidEventData: (id, { items }) => !!items.find((item) => item.id === id),
    getRequestData: ({ items, options }) => ({ items, options }),
});

export default withRequestPreSendUpdate;
