// @flow
import send from "./xhrSender/xhrSender";
import createMockSender from "./mockSender/mockSender";
import { XHR_SENDER_TYPE, MOCK_SENDER_TYPE } from "./consts";

export default send;

export {
    send,
	createMockSender,
    XHR_SENDER_TYPE,
    MOCK_SENDER_TYPE,
};

export type {
	MockOptions,
    SendMethod,
    OnProgress,
    SenderProgressEvent,
    SendOptions,
    SendResult,
} from "./types";

