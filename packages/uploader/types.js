import type { BatchState } from "@rupy/shared";

type BatchUrl = {
	id: string,
	batchId: string,
	url: string,
};

type BatchFile = {
	id: string,
	batchId: string,
	file: Object,
};

export type BatchItem = BatchUrl | BatchFile;

export type Batch = {
	id: string,
	uploaderId: string,
	items: BatchItem[],
	state: BatchState
};