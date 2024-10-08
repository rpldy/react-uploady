// @flow

import type { IsSuccessfulCall } from "@rpldy/shared";

export type MockOptions = {|
	//the time in ms it should take to "upload" (default: 500ms)
	delay?: number,
	//the file size of the mocked upload, used for progress calculation (default: 1M bytes)
	fileSize?: number,
	//the mock intervals (percentages) to emit progress events at (default: [10, 25, 50, 75, 100])
	progressIntervals?: number[],
	//the mock server response to use (default: {"mock": true, "success": true})
	response?: any,
	//the upload request status code (default: 200)
	responseStatus?: number,
    //callback to use to decide whether upload response is successful or not
    isSuccessfulCall?: IsSuccessfulCall
|};

export type MandatoryMockOptions = {[key in keyof MockOptions]: $NonMaybeType<MockOptions[key]>}
