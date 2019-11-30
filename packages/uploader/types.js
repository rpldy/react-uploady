import type {
	BatchState,
	FileState,
	CreateOptions,
	NonMaybeTypeFunc,
	Destination,
	UploadInfo,
	UploadOptions,
} from "@rupy/shared";

export type MandatoryCreateOptions = $Exact<$ObjMap<CreateOptions, NonMaybeTypeFunc>>;

export type MandatoryDestination = $Exact<$ObjMap<Destination, NonMaybeTypeFunc>>;

export type UploaderType = {
	id: string,
	update: (updateOptions: CreateOptions) => void,
	add: (files: UploadInfo | UploadInfo[], addOptions: UploadOptions) => Promise<void>,
	upload: () => void,
	abort: () => void,
	getOptions: () => MandatoryCreateOptions
	on: (name: any, cb: Function) => void,
	off: (name: any, cb?: Function) => void,
};

export type Trigger = (event: string, ...args: mixed[]) => Promise<mixed>[];

export type UploaderEnhancer = (uploader: UploaderType, trigger: Trigger) => UploaderType;

type BatchItemBase = {
	id: string,
	batchId: string,
	state: FileState,
	uploadResponse: any,
	abort: () => void,
	//percentage of upload completed
	completed: number,
	//bytes uploaded
	loaded: number,
};

type BatchUrl = BatchItemBase & {
	url: string,
};

type BatchFile = BatchItemBase & {
	file: Object,
};

export type BatchItem = BatchUrl | BatchFile;

export type Batch = {
	id: string,
	uploaderId: string,
	items: BatchItem[],
	state: BatchState
};