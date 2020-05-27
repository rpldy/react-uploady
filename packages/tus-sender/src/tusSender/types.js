// @flow

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
