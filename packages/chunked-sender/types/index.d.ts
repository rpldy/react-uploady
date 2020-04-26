import { UploaderEnhancer } from "@rpldy/uploader";

export interface ChunkedOptions {
    chunked?: boolean;
    chunkSize?: number;
    retries?: number;
    parallel?: number;
}

export const getChunkedEnhancer: (options: ChunkedOptions) => UploaderEnhancer;

export default getChunkedEnhancer;
