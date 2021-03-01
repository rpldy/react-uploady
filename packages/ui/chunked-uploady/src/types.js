// @flow
import type { UploadyProps } from "@rpldy/uploady";
import type { ChunkedOptions, ChunkFinishEventData, ChunkStartEventData } from "@rpldy/chunked-sender";
import type { SendOptions } from "@rpldy/sender";

export type StartEventResponse = void | boolean | {
    url?: string,
    sendOptions?: SendOptions
};

export type ChunkStartListenerHook = (cb: (data: ChunkStartEventData ) => StartEventResponse) => void;

export type ChunkFinishListenerHook = (cb: (data: ChunkFinishEventData) => void) => void;


export type ChunkedUploadyProps = {|
	...UploadyProps,
	...$Exact<ChunkedOptions>,
|};
