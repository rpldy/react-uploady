import type {
	BatchState,
	FileState,
	CreateOptions,
	NonMaybeTypeFunc,
	Destination,
} from "@rupy/shared";

type BatchItemBase  = {
	id: string,
	batchId: string,
	state: FileState,
	uploadResponse: any,
	abort: () => void,
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

export type MandatoryCreateOptions = $Exact<$ObjMap<CreateOptions, NonMaybeTypeFunc>>;

export type MandatoryDestination = $Exact<$ObjMap<Destination, NonMaybeTypeFunc>>;