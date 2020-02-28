// @flow
import invariant from "invariant";
import type { UploadyContextType } from "@rpldy/uploady";

export const ERROR_MSG = "Uploady - valid UploadyContext not found. Make sure you render inside <Uploady>";

export default (context: ?UploadyContextType): UploadyContextType => {
    invariant(
        context && context.hasUploader(),
        ERROR_MSG
    );

    return context;
};
