// @flow
import { invariant } from "@rpldy/shared";
import { useUploadyContext } from "@rpldy/shared-ui";
import { RETRY_EXT, type BatchRetryMethod } from "@rpldy/retry";
import { NO_EXT } from "./consts";

const useBatchRetry = (): BatchRetryMethod => {
    const context = useUploadyContext();
    const ext = context.getExtension(RETRY_EXT);

    invariant(ext, NO_EXT);

    return ext.retryBatch;
};

export default useBatchRetry;
