// @flow
import send from "./xhrSender/xhrSender";
import createMockSender from "./mockSender/mockSender";

export default send;

export {
    send,
	createMockSender,
};

export type {
	MockOptions,
    SendMethod,
    OnProgress,
    SenderProgressEvent,
    SendOptions,
    SendResult,
} from "./types";

