import type {
	CreateOptions,
	NonMaybeTypeFunc,
	Destination,
	UploadInfo,
	UploadOptions,
} from "@rupy/shared";

// export type MandatoryCreateOptions = $Exact<$ObjMap<CreateOptions, NonMaybeTypeFunc>>;
export type MandatoryCreateOptions = $ObjMap<CreateOptions, NonMaybeTypeFunc>;

export type MandatoryDestination = $Exact<$ObjMap<Destination, NonMaybeTypeFunc>>;

export type UploaderType = {
	id: string,
	update: (updateOptions: CreateOptions) => void,
	add: (files: UploadInfo | UploadInfo[], addOptions: UploadOptions) => Promise<void>,
	upload: () => void,
	abort: () => void,
	getOptions: () => MandatoryCreateOptions,
	on: (name: any, cb: Function) => void,
	off: (name: any, cb?: Function) => void,
};

export type Trigger = (event: string, ...args: mixed[]) => Promise<mixed>[];

export type UploaderEnhancer = (uploader: UploaderType, trigger: Trigger) => UploaderType;