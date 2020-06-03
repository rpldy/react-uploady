// @flow
import { BATCH_STATES, FILE_STATES } from "./consts";

export type NonMaybeTypeFunc = <T>(param: T) => $NonMaybeType<T>;

export type Destination = {
	//upload URL
	url?: ?string,
	//The name of the param in the upload request (default: input element's name)
	filesParamName?: ?string,
	//collection of params to pass along with the upload
	params?: Object,
	//collection of headers to send with
	headers?: Object,
    //HTTP method to use when uploading
    method?: ?string,
};

export type BatchState = $Values<typeof BATCH_STATES>;
export type FileState = $Values<typeof FILE_STATES>;

export type ProgressInfo = {
	done: boolean,
	failed: boolean,
	percent: number,
	response: ?any,
	metadata: ?Object,
};

export type UploadData = {
    status: number,
	state: FileState,
	response: any,
};

export type FormatParamGroupNameMethod = (number, string) => string;

type BatchItemBase = {|
	id: string,
	batchId: string,
	state: FileState,
	uploadResponse?: any,
	//percentage of upload completed
	completed: number,
	//bytes uploaded
	loaded: number,
	recycled: boolean,
|};

export type FileLike = {
	name: string,
	size: number,
	type: string,
	lastModified: number,
}

type BatchUrl = {
	...BatchItemBase,
	url: string,
};

type BatchFile = {
	...BatchItemBase,
	file: FileLike,
};

export type BatchItem = BatchUrl & BatchFile;

export type UploadInfo = string | Object | BatchItem;

export type Batch = {
	id: string,
	uploaderId: string,
	items: BatchItem[],
	state: BatchState,
    //average of percentage of upload completed for batch items
    completed: number,
    //sum of bytes uploaded for batch items
    loaded: number,
};

export type FileFilterMethod = (File | string) => boolean;

export type UploadOptions = {|
	//whether to automatically upload files when they are added (default: true)
	autoUpload?: boolean,
	//destination properties related to the server files will be uploaded to
	destination?: ?Destination,
	//name (attribute) of the file input field (default: "file")
	inputFieldName?: string,
	//optional function to determine the upload field name when more than file is grouped in a single upload
	formatGroupParamName?: FormatParamGroupNameMethod,
	//whether to group multiple files in a single request (default: false)
	grouped?: boolean,
	//The maximum of files to group together in a single request  (default: 5)
	maxGroupSize?: number,
	//optional function to use to filter by filename/url
	fileFilter?: FileFilterMethod,
	//HTTP method to use when uploading (default: POST)
	method?: string,
	//collection of params to pass along with the upload (Destination params take precedence)
	params?: Object,
	//whether to parse server response as json even if no json content type header found (default: false)
	forceJsonResponse?: boolean,
	//whether to set XHR withCredentials to true (default: false)
	withCredentials?: boolean,
    //whether file/url data will be sent as part of formdata (default: true)
    sendWithFormData?: boolean,
|};

export type Trigger<T> = (string, ...args: mixed[]) => Promise<?T>[];

export type Cancellable = (string, ...args: mixed[]) => Promise<boolean>;

export type Updater<T> = (string, ...args: mixed[]) => Promise<?T>;

export type GetExact<T> = T & $Shape<T>;

export type RequestOptions = {
    method?: string,
    headers?: Object,
    withCredentials?: boolean,
    preSend?: (XMLHttpRequest) => void,
};
