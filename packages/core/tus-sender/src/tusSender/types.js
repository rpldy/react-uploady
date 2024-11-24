// @flow
import type { BatchItem } from "@rpldy/shared";

export type ParallelPartData = {
    identifier: string,
    uploadUrl: ?string,
    lastOffset: number,
    state: "unknown" | "idle" | "uploading",
    chunkIds: string[],
};

export type ItemInfo = {
	id: string,
	uploadUrl: ?string,
	size: number,
	offset: number,
	abort?: () => boolean,
	parallelParts: ParallelPartData[],

    //these props will be populated only for items that represent a parallel chunk:
    parallelIdentifier: ?string,
    orgItemId: ?string,
};

export type InitData = {|
	uploadUrl?: string,
	offset?: number,
	isNew?: boolean,
	isDone?: boolean,
	canResume?: boolean,
|};

export type InitUploadResult = {
	request: Promise<?InitData>,
	abort: () => boolean,
};

export type ResumeStartEventData = {
    url: string,
    item: BatchItem,
    resumeHeaders?: Object,
};

export type ResumeStartEventResponse = {
    url?: string,
    resumeHeaders?: Object,
};
