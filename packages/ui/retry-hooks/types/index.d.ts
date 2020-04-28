import { UploadOptions } from "@rpldy/shared";
import retryEnhancer, { RETRY_EVENT } from "@rpldy/retry";

export default retryEnhancer;

export {
    RETRY_EVENT,

    retryEnhancer,
};

export type RetryMethod = (id?: string) => boolean;

export type RetryBatchMethod = (batchId?: string) => boolean;

export const useRetry: () => RetryMethod;

export const useBatchRetry: () => RetryBatchMethod;

type RetryEventData = {
    items: string[];
    options: UploadOptions | void;
};

type RetryEventCallback = (data: RetryEventData) => void;

export const useRetryListener: (cb: RetryEventCallback) => void;
