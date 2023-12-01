// @flow
import { devFreeze } from "@rpldy/shared";

export const MOCK_DEFAULTS: Object = devFreeze({
	delay: 500,
	progressIntervals: [10, 25, 50, 75, 99],
});
