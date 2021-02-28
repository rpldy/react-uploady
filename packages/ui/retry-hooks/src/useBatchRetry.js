// @flow
import { invariant } from "@rpldy/shared";
import { useUploadyContext } from "@rpldy/shared-ui";
import { RETRY_EXT } from "@rpldy/retry";
import { NO_EXT } from "./consts";

export default (): any => {
    const context = useUploadyContext();
    const ext = context.getExtension(RETRY_EXT);

    invariant(ext, NO_EXT);

    return ext.retryBatch;
};
