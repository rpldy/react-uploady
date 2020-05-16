// @flow
import type { BatchItem, UploadData } from "@rpldy/shared";
import type { SendMethod, SendOptions } from "@rpldy/sender";
import type { OffMethod, OnAndOnceMethod } from "@rpldy/life-events";

export type ChunkedOptions = {|
    //whether to divide the uploaded file into chunks (default: true)
    chunked?: boolean,
    //the maximum chunk size (default: 5242880 bytes)
    chunkSize?: number,
    //the number of times to retry a failed chunk (default: 0)
    retries?: number,
    //the number of chunks to upload in parallel (default: 0)
    parallel?: number,
|};

export type ChunkedSendOptions = {|
    ...SendOptions,
    //the byte to start from (designed for resumable) (default: 0)
    startByte?: number
|};

export type MandatoryChunkedOptions = {|
    chunked: boolean,
    chunkSize: number,
    retries: number,
    parallel: number,
|};

export type ChunkedSender = {
    send: SendMethod,
    on: OnAndOnceMethod,
    once: OnAndOnceMethod,
    off: OffMethod,
};

export type ChunkEventData = {
    id: string,
    start: number,
    end: number,
};

export type ChunkStartEventData = {
    item: BatchItem,
    chunk: ChunkEventData,
    sendOptions: SendOptions,
    url: string,
};

export type ChunkFinishEventData = {
    item: BatchItem,
    chunk: ChunkEventData,
    uploadData: UploadData,
};
