// @flow
import type { BatchItem, UploadOptions } from "@rpldy/shared";

export type RetryEventData = {
    items: BatchItem[];
    options: UploadOptions | void;
};

export type RetryEventCallback = (data: RetryEventData) => void;

export type RetryListenerHook = (cb: RetryEventCallback) => void;
