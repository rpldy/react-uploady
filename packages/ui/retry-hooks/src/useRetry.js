// @flow
import { invariant } from "@rpldy/shared";
import { useUploadyContext } from "@rpldy/shared-ui";
import { RETRY_EXT } from "@rpldy/retry";
import { NO_EXT } from "./consts";

import type { UploadOptions } from "@rpldy/shared";

const useRetry = (): (itemId?: string, options?: UploadOptions) => boolean => {
    const context = useUploadyContext();
    const ext = context.getExtension(RETRY_EXT);

    invariant(ext, NO_EXT);

    return ext.retry;
};

export default useRetry;
