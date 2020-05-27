import { UploaderEnhancer } from "@rpldy/uploader";
import { ChunkedOptions } from "@rpldy/chunked-sender";

export interface TusOptions extends ChunkedOptions{
    version?: string;
    featureDetection?: boolean;
    featureDetectionUrl?: string | null;
    resume?: boolean;
    deferLength?: boolean;
    overrideMethod?: boolean;
    sendDataOnCreate?: boolean;
    storagePrefix?: string;
    lockedRetryDelay?: number;
    forgetOnSuccess?: boolean;
}

export const getTusEnhancer: (options: TusOptions) => UploaderEnhancer;

export default getTusEnhancer;