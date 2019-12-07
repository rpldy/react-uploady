// @flow

import send from "./src/sender";
import createMockSender from "./src/mockSender/mockSender";

import type { SendOptions, SendResult, UploadData, SendMethod } from "./types";

export default send;

export {
	createMockSender,
};

export type {
	SendOptions,
	SendResult,
	UploadData,
	SendMethod
};

