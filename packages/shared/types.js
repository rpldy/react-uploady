// @flow
import { BATCH_STATES, FILE_STATES } from "./src/consts";

export type NonMaybeTypeFunc = <T>(param: T) => $NonMaybeType<T>;

export type Destination = {
	//upload URL
	url: string,
	//The name of the param in the upload request (default: input element's name)
	filesParamName?: string,
	//collection of params to pass along with the upload
	params?: Object,
};

export type UploaderType = {
	id: string,
	// setDestination: Function,
	add: Function,
	upload: Function,
	abort: Function,
	on: Function,
};

export type UploadInfo = string | Object;

export type BatchState = $Keys<typeof BATCH_STATES>;
export type FileState = $Keys<typeof FILE_STATES>;

export type ProgressInfo = {
	done: boolean,
	failed: boolean,
	percent: number,

	response: ?any,
	metadata: ?Object,
};

export type UploadOptions = {
	//whether to automatically upload files when they are added (default: true)
	autoUpload?: boolean,
	//destination properties related to the server files will be uploaded to
	destination?: Destination,
	//whether to allow more than one file to be selected for upload (default: true)
	multiple?: boolean,
	//whether to group multiple files in a single request (default: false)
	grouped?: boolean,
	//The maximum of files to group together in a single request  (default: 5)
	maxGroupSize?: number,
	//whether to attempt and load a preview of the file (for images and videos) (default: false)
	preview?: boolean,
	//the maximum file size (in kb) to attempt to load a preview for an image (default: 20,000,000)
	maxPreviewImageSize?: number,
	//the maximum file size (in kb) to attempt to load a preview for a video (default: 100,000,000)
	maxPreviewVideoSize?: number,
	//the regex or function to use to filter by filename/url
	fileFilter?: RegExp | Function,
	//The accept value to pass the file input
	inputAccept?: string,
	//the upload encoding (default: "multipart/form-data")
	encoding?: string,
	//HTTP method (default: POST)
	method: string,
	//collection of params to pass along with the upload (Destination params take precedence)
	params?: Object,
};

export type CreateOptions = UploadOptions & {
	//whether multiple upload requests can be issued simultaneously (default: false)
	concurrent?: boolean,
	//the maximum allowed for simultaneous requests (default: 2)
	maxConcurrent?: number,
};

// export type AddOptions = UploadOptions & {
//
// };

export type UploadyProps = CreateOptions & {
	uploader?: UploaderType,
	//the container element the file input field will be render to (default: document.body)
	inputFieldContainer?: string | HTMLElement,
	//the name of the file input field to use (default: "file")
	inputFieldName?: string,
	children?: any,
};


export type ChunkedUploadyProps = UploadyProps & {
	//whether to divide the uploaded file into chunks (default: true)
	chunked?: boolean,
	//the maximum chunk size (default: 5000000 bytes)
	chunkSize?: number,

}

export type UploaderEnhancer = (uploader: UploaderType, trigger: Function) => UploaderType;