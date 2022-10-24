import { UploadOptions } from "@rpldy/shared";
import { UploaderEnhancer } from "@rpldy/uploader";

export const retryEnhancer: UploaderEnhancer;

export const RETRY_EVENT = "RETRY_EVENT";

export type RetryMethod = (id?: string, options?: UploadOptions) => boolean;

export type RetryBatchMethod = (batchId: string, options?: UploadOptions) => boolean;

export default retryEnhancer;
