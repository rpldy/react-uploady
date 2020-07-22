// @flow
import { MOCK_SENDER_TYPE } from "./consts";
import createMockSender from "./mockSender";
import getMockSenderEnhancer from "./getMockSenderEnhancer";

export default createMockSender;

export {
	MOCK_SENDER_TYPE,

	createMockSender,
	getMockSenderEnhancer
};

export type {
	MockOptions,
} from "./types";

