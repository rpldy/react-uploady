// @flow
import { invariant } from "@rpldy/shared";
import { useUploadyContext } from "@rpldy/shared-ui";
import { RETRY_EXT, type RetryMethod } from "@rpldy/retry";
import { NO_EXT } from "./consts";

const useRetry = (): RetryMethod => {
    const context = useUploadyContext();
    const ext = context.getExtension(RETRY_EXT);

    invariant(ext, NO_EXT);

    return ext.retry;
};

export default useRetry;
