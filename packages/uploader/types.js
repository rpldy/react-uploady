import type {
	BatchState,
	FileState,
	CreateOptions,
	NonMaybeTypeFunc,} from "@rupy/shared";

type BatchItemBase  = {
	id: string,
	batchId: string,
	state: FileState,
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
