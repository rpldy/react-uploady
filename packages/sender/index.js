// @flow

import send from "./src/sender";
import createMockSender from "./src/mockSender/mockSender";

import type { MockOptions, } from "./src/types";

export default send;

export {
	createMockSender,
};

export type {
	MockOptions,
};

