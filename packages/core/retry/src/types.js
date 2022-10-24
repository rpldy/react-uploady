// @flow
import type { BatchItem, UploadOptions } from "@rpldy/shared";

export type State = {
    batchIdsMap: {
        [string]: string[]
    },
    failed: {
        [string]: BatchItem
    },
};

export type RetryState = {
    updateState: ((State) => void) => void,
    getState: () => State,
};

export type BatchRetryMethod = (batchId: string, options?: UploadOptions) => boolean;

export type RetryMethod = (itemId?: string, options?: UploadOptions) => boolean;
