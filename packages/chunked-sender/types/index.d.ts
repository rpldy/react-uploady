import { UploaderEnhancer } from "@rpldy/uploader";
import { SendMethod } from "@rpldy/sender";
import { OffMethod, OnAndOnceMethod } from "@rpldy/life-events";

export interface ChunkedOptions {
    chunked?: boolean;
    chunkSize?: number;
    retries?: number;
    parallel?: number;
}

export type ChunkedSender = {
    send: SendMethod;
    on: OnAndOnceMethod;
    once: OnAndOnceMethod;
    off: OffMethod;
};

export const getChunkedEnhancer: (options: ChunkedOptions) => UploaderEnhancer;

export const createChunkedSender: (options: ChunkedOptions) => ChunkedSender;

export const CHUNKING_SUPPORT: boolean;

export default getChunkedEnhancer;
