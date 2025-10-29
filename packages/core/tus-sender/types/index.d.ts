import { BatchItem } from "@rpldy/shared";
import { UploaderEnhancer } from "@rpldy/uploader";
import { CHUNKING_SUPPORT, ChunkedOptions, ChunkEventData } from "@rpldy/chunked-sender";

export {
    CHUNKING_SUPPORT
};

export enum TUS_EVENTS {
    RESUME_START = "RESUME_START",
    PART_START = "PART_START",
}

export interface TusOptions extends ChunkedOptions {
    version?: string;
    featureDetection?: boolean;
    featureDetectionUrl?: string | null;
    onFeaturesDetected?: (extensions: string[]) => TusOptions | void;
    resume?: boolean;
    deferLength?: boolean;
    overrideMethod?: boolean;
    sendDataOnCreate?: boolean;
    storagePrefix?: string;
    lockedRetryDelay?: number;
    forgetOnSuccess?: boolean;
    ignoreModifiedDateInStorage?: boolean;
    resumeHeaders?: Record<string, string>;
}

export interface TusResumeStartEventData {
    url: string;
    item: BatchItem;
    resumeHeaders?: Record<string, string>;
}

export type TusResumeStartEventResponse = void | boolean | {
    url?: string;
    resumeHeaders?: Record<string, string>;
};

export interface TusPartStartEventData {
    url: string;
    item: BatchItem;
    headers: Record<string, string>;
    chunk: ChunkEventData;
}

export type TusPartStartEventResponse = void | {
    url?: string;
    headers?: Record<string, string>;
};

export const clearResumables: () => void;

export const getTusEnhancer: (options: TusOptions) => UploaderEnhancer;

export default getTusEnhancer;
