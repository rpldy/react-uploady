// @flow
import type { BatchItem, UploadData } from "@rpldy/shared";
import type { SendMethod, SendOptions, OnProgress } from "@rpldy/sender";

export type ChunkedOptions = {
    //whether to divide the uploaded file into chunks (default: true)
    chunked?: boolean,
    //the maximum chunk size (default: 5242880 bytes)
    chunkSize?: number,
    //the number of times to retry a failed chunk (default: 0)
    retries?: number,
    //the number of chunks to upload in parallel (default: 0)
    parallel?: number,
    //whether to send Content-Range header with chunks (default: true)
    sendWithRangeHeader?: boolean,
};

export type ChunkedSendOptions = {
    ...SendOptions,
    //the byte to start from (designed for resumable) (default: 0)
    startByte?: number
};

export type MandatoryChunkedOptions = {|
    chunked: boolean,
    chunkSize: number,
    retries: number,
    parallel: number,
    sendWithRangeHeader: boolean,
|};

export type ChunkedSender = {
    send: SendMethod<ChunkedSendOptions>,
};

export type ChunkEventData = {
    id: string,
    start: number,
    end: number,
	index: number,
	attempt: number,
};

export type ChunkStartEventData = {
    item: BatchItem,
    chunk: ChunkEventData,
	chunkItem: BatchItem,
    sendOptions: SendOptions,
    url: string,
    remainingCount: number,
    totalCount: number,
	onProgress: OnProgress
};

export type ChunkFinishEventData = {
    item: BatchItem,
    chunk: ChunkEventData,
    uploadData: UploadData,
};
