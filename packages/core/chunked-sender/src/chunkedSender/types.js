// @flow
import type { UploadData } from "@rpldy/shared";
import type { SendOptions } from "@rpldy/sender";
import type { MandatoryChunkedOptions } from "../types";

export type Chunk = {
    id: string,
    start: number,
    end: number,
    data: ?Blob,
    attempt: number,
    uploaded: number,
	index: number,
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
    url: ?string,
    sendOptions: SendOptions,
    chunkCount: number,
    startByte: number,
    lastChunkErrorData: ?{ status: number, response: any },
|};

type UpdateStateMethod = ((State) => void) => void;
type GetStateMethod = () => State;

export type ChunkedState = {|
    getState: GetStateMethod,
    updateState: UpdateStateMethod,
|};

export type ChunksSendResponse = {
    sendPromise: Promise<UploadData>,
    abort: () => boolean
};
