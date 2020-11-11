// @flow
import getXhrSend from "./xhrSender/xhrSender";
import { XHR_SENDER_TYPE } from "./consts";

const send = getXhrSend();

export default send;

export {
    send,
    getXhrSend,
    XHR_SENDER_TYPE,
};

export type {
    SendMethod,
    OnProgress,
    SenderProgressEvent,
    SendOptions,
    SendResult,
} from "./types";

