// @flow
import { useContext } from "react";
import invariant from "invariant";
import { UploadyContext, assertContext } from "@rpldy/shared-ui";
import { RETRY_EXT, NO_EXT } from "./consts";

export default () => {
    const context = assertContext(useContext(UploadyContext));
    const ext = context.getExtension(RETRY_EXT);

    invariant(ext, NO_EXT);

    return ext.retryBatch;
};
