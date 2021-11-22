// @flow
import { invariant } from "@rpldy/shared";
import { getIsVersionRegisteredAndDifferent, getRegisteredVersion } from "./uploadyVersion";

import type { UploadyContextType } from "./types";

export const ERROR_MSG = "Uploady - Valid UploadyContext not found. Make sure you render inside <Uploady>";
export const DIFFERENT_VERSION_ERROR_MSG = `Uploady - Valid UploadyContext not found.
You may be using packages of different Uploady versions. <Uploady> and all other packages using the context provider must be of the same version: %s`;

const assertContext = (context: ?UploadyContextType): UploadyContextType => {
    invariant(
        !getIsVersionRegisteredAndDifferent(),
        DIFFERENT_VERSION_ERROR_MSG,
        getRegisteredVersion(),
    );

    invariant(
        context && context.hasUploader(),
        ERROR_MSG
    );

    return context;
};

export default assertContext;
