// @flow
import { devFreeze } from "@rpldy/shared";
import type { MockOptions } from "./types";

export const MOCK_DEFAULTS: MockOptions = devFreeze({
	delay: 500,
	progressIntervals: [10, 25, 50, 75, 99],
});
