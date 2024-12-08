// @flow
import type { BatchItem, UploadData } from "@rpldy/shared";

export type ParallelPartData = {
    identifier: string,
    item: BatchItem,
    start: number,
    end: number,
    orgItemId: string,
};

export type ItemInfo = {
	id: string,
	uploadUrl: ?string,
	size: number,
	offset: number,
	abort?: () => boolean,
    //only available for parallel tus upload
	parallelParts?: ParallelPartData[],
    //these props will be populated only for items that represent a parallel part:
    parallelIdentifier: ?string,
    orgItemId: ?string,
};

export type InitData = {|
	uploadUrl: string,
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

export type InitRequestResult = {|abort: () => boolean, request: Promise<UploadData>|};
