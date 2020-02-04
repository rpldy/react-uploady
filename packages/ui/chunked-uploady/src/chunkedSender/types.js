// @flow

import type { SendOptions, UploadData } from "@rpldy/shared";
import type { MandatoryChunkedOptions } from "../types";

export type Chunk = {
	id: string,
	start: number,
	end: number,
	data: ?Blob,
	attempt: number,
	uploaded: number,
};

export type State = {
	finished: boolean,
	aborted: boolean,
	requests: { [string]: { abort: ()=>void } },
	responses: any[],
	chunks: Chunk[],
	url: string,
	sendOptions: SendOptions,
	...MandatoryChunkedOptions,
};

export type ChunksSendResponse = {
	sendPromise: Promise<UploadData>,
	abort: () => boolean
};