// @flow
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { createRequestUpdateHoc, type RequestUpdateHoc } from "./createRequestUpdateHoc";

const withRequestPreSendUpdate: RequestUpdateHoc<{ id: string }> = createRequestUpdateHoc(
    UPLOADER_EVENTS.REQUEST_PRE_SEND,
    ({ id }) => !!id,
    (id, { items }) => !!items.find((item) => item.id === id),
    (requestData) => requestData,
    ({ id }) => [id],
);

export default withRequestPreSendUpdate;
