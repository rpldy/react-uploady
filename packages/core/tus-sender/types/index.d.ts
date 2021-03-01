import { UploaderEnhancer } from "@rpldy/uploader";
import { CHUNKING_SUPPORT, ChunkedOptions } from "@rpldy/chunked-sender";

export {
    CHUNKING_SUPPORT
};

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
}

export const clearResumables: () => void;

export const getTusEnhancer: (options: TusOptions) => UploaderEnhancer;

export default getTusEnhancer;
