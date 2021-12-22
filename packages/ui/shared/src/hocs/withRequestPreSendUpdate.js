// @flow
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { createRequestUpdateHoc, type RequestUpdateHoc } from "./createRequestUpdateHoc";

const withRequestPreSendUpdate: RequestUpdateHoc = createRequestUpdateHoc(
    UPLOADER_EVENTS.REQUEST_PRE_SEND,
    (id, { items }) => !!items.find((item) => item.id === id),
    (requestData) => requestData,
);

export default withRequestPreSendUpdate;
