// @flow
import { invariant } from "@rpldy/shared";
import type { UploadyContextType } from "./types";

export const ERROR_MSG = "Uploady - valid UploadyContext not found. Make sure you render inside <Uploady>";

export default (context: ?UploadyContextType): UploadyContextType => {
    invariant(
        context && context.hasUploader(),
        ERROR_MSG
    );

    return context;
};
