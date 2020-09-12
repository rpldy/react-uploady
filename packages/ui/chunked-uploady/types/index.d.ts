import * as React from "react";
import { UploadyProps } from "@rpldy/uploady";
import { ChunkedOptions, ChunkFinishEventData, ChunkStartEventData } from "@rpldy/chunked-sender";
import { SendOptions } from "@rpldy/sender";

export * from "@rpldy/uploady";

export interface ChunkedUploadyProps extends UploadyProps, ChunkedOptions {}

export const ChunkedUploady: React.ComponentType<ChunkedUploadyProps>;

export type StartEventResponse = void | boolean | {
    url?: string,
    sendOptions?: SendOptions
};

export const useChunkStartListener: (cb: (data: ChunkStartEventData ) => StartEventResponse) => void;

export const useChunkFinishListener: (cb: (data: ChunkFinishEventData) => void) => void;

export default ChunkedUploady;
