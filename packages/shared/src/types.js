// @flow
import { BATCH_STATES, FILE_STATES } from "./consts";
import type { UploaderEnhancer } from "@rpldy/uploader";

export type NonMaybeTypeFunc = <T>(param: T) => $NonMaybeType<T>;

export type Destination = {
	//upload URL
	url: ?string,
	//The name of the param in the upload request (default: input element's name)
	filesParamName?: ?string,
	//collection of params to pass along with the upload
	params?: Object,
	//collection of headers to send with
	headers?: Object,
    //HTTP method to use when uploading
    method?: ?string,
};

export type UploadInfo = string | Object;

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
	state: FileState,
	response: any,
};

export type SendResult = {
	request: Promise<UploadData>,
	abort: () => boolean,
};

export type SenderProgressEvent = { total: number, loaded: number };

export type FormatParamGroupNameMethod = (number, string) => string;

export type SendOptions = {
	method: string,
	paramName: string,
	params: Object,
	headers?: Object,
	forceJsonResponse: ?boolean,
	withCredentials: ?boolean,
	formatGroupParamName: ?FormatParamGroupNameMethod,
};

type BatchItemBase = {|
	id: string,
	batchId: string,
	state: FileState,
	uploadResponse?: any,
	//percentage of upload completed
	completed: number,
	//bytes uploaded
	loaded: number,
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

export type OnProgress = (e: SenderProgressEvent, Object[]) => void;

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

export type SendMethod = (item: BatchItem[], url: string, options: SendOptions, onProgress: OnProgress) => SendResult;

export type FileFilterMethod = (mixed) => boolean;

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
|};

export type CreateOptions =  {|
	...UploadOptions,
    //uploader enhancer function
    enhancer?: UploaderEnhancer,
	//whether multiple upload requests can be issued simultaneously (default: false)
	concurrent?: boolean,
	//the maximum allowed for simultaneous requests (default: 2)
	maxConcurrent?: number,
	//the send method to use. Allows overriding the method used to send files to the server for example using a mock (default: @rupy/sender)
	send?: ?SendMethod,
|};

export type Trigger<T> = (string, ...args: mixed[]) => Promise<?T>[];

export type Cancellable = (string, ...args: mixed[]) => Promise<boolean>;

export type Updater<T> = (string, ...args: mixed[]) => Promise<?T>;

export type GetExact<T> = T & $Shape<T>;
