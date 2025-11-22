import { BatchItem, FileLike, UploadData } from "@rpldy/shared";
import { OnProgress, SendMethod, SendOptions } from "@rpldy/sender";
import { UploaderEnhancer } from "@rpldy/uploader";

export enum CHUNK_EVENTS {
    CHUNK_START = "CHUNK_START",
    CHUNK_FINISH = "CHUNK_FINISH",
}

export interface ChunkedOptions {
    chunked?: boolean;
    chunkSize?: number;
    retries?: number;
    parallel?: number;
    sendWithRangeHeader?: boolean;
}

export type ChunkedSender = {
    send: SendMethod;
};

export type ChunkEventData = {
    id: string;
    start: number;
    end: number;
    index: number;
    attempt: number;
};

export type ChunkStartEventData = {
    item: BatchItem;
    chunk: ChunkEventData;
    chunkItem: BatchItem;
    sendOptions: SendOptions;
    url: string;
    remainingCount: number,
    totalCount: number,
    onProgress: OnProgress
};

export type ChunkFinishEventData = {
    item: BatchItem;
    chunk: ChunkEventData;
    uploadData: UploadData;
};

export const DEFAULT_CHUNK_SIZE: number;

export const getChunkedEnhancer: (options: ChunkedOptions) => UploaderEnhancer;

export const createChunkedSender: (options: ChunkedOptions) => ChunkedSender;

export const CHUNKING_SUPPORT: boolean;

export const hasWindow: boolean;

export const getChunkDataFromFile: (file: FileLike, start: number, end: number) => Blob | undefined;

export default getChunkedEnhancer;
