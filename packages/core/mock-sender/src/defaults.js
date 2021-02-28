// @flow

import { devFreeze } from "@rpldy/shared";

export const MOCK_DEFAULTS: any = devFreeze({
	delay: 500,
	fileSize: 1e+6,
	progressIntervals: [10, 25, 50, 75, 99],
});
