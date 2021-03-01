// @flow
import type { UploadOptions } from "@rpldy/shared";

export type RetryEventData = {
    items: string[];
    options: UploadOptions | void;
};

export type RetryEventCallback = (data: RetryEventData) => void;

export type RetryListenerHook = (cb: RetryEventCallback) => void;
