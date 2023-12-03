// @flow
import React, { useMemo } from "react";
import { hasWindow } from "@rpldy/shared";
import { logWarning } from "@rpldy/shared-ui";
import Uploady, { composeEnhancers } from "@rpldy/uploady";
import getChunkedEnhancer, { CHUNKING_SUPPORT } from "@rpldy/chunked-sender";

import type { UploaderEnhancer, UploaderCreateOptions } from "@rpldy/uploader";
import type { ChunkedOptions } from "@rpldy/chunked-sender";
import type { ChunkedUploadyProps } from "./types";

const getEnhancer = (options: ChunkedOptions, enhancer: ?UploaderEnhancer<UploaderCreateOptions>) => {
    const chunkedEnhancer = getChunkedEnhancer(options);
    return enhancer ? composeEnhancers(chunkedEnhancer, enhancer) : chunkedEnhancer;
};

const ChunkedUploady = (props: ChunkedUploadyProps): React$Element<typeof Uploady> => {
    const { chunked, chunkSize, retries, parallel, ...uploadyProps } = props;

    const enhancer = useMemo(
        () => CHUNKING_SUPPORT ?
            getEnhancer({ chunked, chunkSize, retries, parallel }, props.enhancer) :
            undefined,
        [props.enhancer, chunked, chunkSize, retries, parallel]);

    return <Uploady {...uploadyProps} enhancer={enhancer}/>;
};

logWarning(CHUNKING_SUPPORT || !hasWindow(), "This browser doesn't support chunking. Consider using @rpldy/uploady instead");

export default ChunkedUploady;
