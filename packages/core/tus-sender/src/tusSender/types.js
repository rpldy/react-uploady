// @flow
import type { BatchItem } from "@rpldy/shared";

export type ItemInfo = {
	id: string,
	uploadUrl: ?string,
	size: number,
	offset: number,
	abort?: () => boolean,
	parallelChunks: string[],
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
