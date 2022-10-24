import { BatchItem, UploadOptions } from "@rpldy/shared";
import retryEnhancer, {
    RETRY_EVENT,
    RetryMethod,
    RetryBatchMethod,
} from "@rpldy/retry";

export default retryEnhancer;

export {
    RETRY_EVENT,
    RetryMethod,
    RetryBatchMethod,
    retryEnhancer,
};

export const useRetry: () => RetryMethod;

export const useBatchRetry: () => RetryBatchMethod;

export type RetryEventData = {
    items: BatchItem[];
    options: UploadOptions | void;
};

export type RetryEventCallback = (data: RetryEventData) => void;

export const useRetryListener: (cb: RetryEventCallback) => void;
