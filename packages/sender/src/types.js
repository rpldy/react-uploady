// @flow

import type {
    BatchItem,
    NonMaybeTypeFunc,
    UploadData,
    FormatParamGroupNameMethod,
} from "@rpldy/shared";

export type MockOptions = {|
	//the time in ms it should take to "upload" (default: 500ms)
	delay?: number,
	//the file size of the mocked upload, used for progress calculation (default: 1M bytes)
	fileSize?: number,
	//the mock intervals (percentages) to emit progress events on (default: [10, 25, 50, 75, 100])
	progressIntervals?: number[],
	//the mock server response to use (default: {"mock": true, "success": true})
	response?: any,
    responseStatus?: number,
|};

export type MandatoryMockOptions = $ObjMap<MockOptions, NonMaybeTypeFunc>;

export type SendResult = {
    request: Promise<UploadData>,
    abort: () => boolean,
    senderType: string,
};

export type SendOptions = {
    method: string,
    paramName: string,
    params: Object,
    headers?: Object,
    forceJsonResponse: ?boolean,
    withCredentials: ?boolean,
    formatGroupParamName: ?FormatParamGroupNameMethod,
    sendWithFormData?: boolean,
};

export type SenderProgressEvent = { total: number, loaded: number };

export type OnProgress = (e: SenderProgressEvent, Object[]) => void;

export type SendMethod<-T: SendOptions> = (item: BatchItem[], url: string, options: T, onProgress: OnProgress) => SendResult;
