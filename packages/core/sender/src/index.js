// @flow
import send from "./xhrSender/xhrSender";
import { XHR_SENDER_TYPE } from "./consts";

export default send;

export {
    send,
    XHR_SENDER_TYPE,
};

export { default as MissingUrlError } from "./MissingUrlError";

export type {
    SendMethod,
    OnProgress,
    SenderProgressEvent,
    SendOptions,
    SendResult,
} from "./types";

