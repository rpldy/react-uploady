// @flow
import send from "./xhrSender/xhrSender";
import createMockSender from "./mockSender/mockSender";

import type { MockOptions, } from "./types";

export default send;

export {
	createMockSender,
};

export type {
	MockOptions,
};

