// @flow
import React, { useMemo } from "react";
import { logger } from "@rpldy/shared";
import UploadyContext, { createContextApi } from "./UploadyContext";
import useUploader from "./useUploader";

import type { NoDomUploadyProps } from "./types";

const NoDomUploady = (props: NoDomUploadyProps) => {
    const {
        listeners,
        debug,
        children,
        inputRef,
        ...uploadOptions
    } = props;

    logger.setDebug(!!debug);
    logger.debugLog("@@@@@@ Uploady Rendering @@@@@@", props);

    const uploader = useUploader(uploadOptions, listeners);

    const api = useMemo(() =>
            createContextApi(uploader, inputRef),
        [uploader, inputRef]
    );

    return <UploadyContext.Provider value={api}>
        {children}
    </UploadyContext.Provider>;
};

export default NoDomUploady;
