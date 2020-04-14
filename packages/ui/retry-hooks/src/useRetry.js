// @flow
import { useContext } from "react";
import { invariant } from "@rpldy/shared";
import { UploadyContext, assertContext } from "@rpldy/shared-ui";
import { RETRY_EXT } from "@rpldy/retry";
import { NO_EXT } from "./consts";

export default () => {
    const context = assertContext(useContext(UploadyContext));
    const ext = context.getExtension(RETRY_EXT);

    invariant(ext, NO_EXT);

    return ext.retry;
};
