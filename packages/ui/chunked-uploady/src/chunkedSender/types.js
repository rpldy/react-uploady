// @flow

import type { SendOptions, UploadData } from "@rpldy/shared";
import type { MandatoryChunkedOptions } from "../types";

export type Chunk = {
    id: string,
    start: number,
    end: number,
    data: ?Blob,
    attempt: number,
    uploaded: number
};

export type State = {|
    ...MandatoryChunkedOptions,
    finished: boolean,
    aborted: boolean,
    error: boolean,
    requests: { [string]: { abort: () => boolean } },
    responses: any[],
    chunks: Chunk[],
    uploaded: { [string]: number },
    url: string,
    sendOptions: SendOptions,
|};

export type ChunksSendResponse = {
    sendPromise: Promise<UploadData>,
    abort: () => boolean
};
