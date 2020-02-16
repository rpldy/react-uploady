// @flow
import React, { useMemo } from "react";
// $FlowFixMe - for some reason flow doesnt see warning is installed...
import warning from "warning";
import Uploady from "@rpldy/uploady";
import { CHUNKING_SUPPORT } from "./utils";
import getChunkedSend from "./chunkedSender";

import type { UploaderType, UploaderEnhancer } from "@rpldy/uploader";
import type { ChunkedUploadyProps } from "./types";

const getEnhancer = (chunkedSend, enhancer: ?UploaderEnhancer) => {
    return (uploader: UploaderType, trigger): UploaderType => {
        uploader.update({ send: chunkedSend });
        return enhancer ? enhancer(uploader, trigger) : uploader;
    };
};

const ChunkedUploady = (props: ChunkedUploadyProps) => {
    const { chunked, chunkSize, retries, parallel, ...uploadyProps } = props;

    const chunkedSend = useMemo(
        () => {
            return CHUNKING_SUPPORT ? getChunkedSend({
                chunked,
                chunkSize,
                retries,
                parallel
            }) : null;
        },
        [
            chunked,
            chunkSize,
            retries,
            parallel
        ]);

    const enhancer = useMemo(
        () => CHUNKING_SUPPORT ? getEnhancer(chunkedSend, props.enhancer) : undefined,
        [chunkedSend, props.enhancer]);

    return <Uploady {...uploadyProps} enhancer={enhancer}/>;
};

warning(CHUNKING_SUPPORT, "This browser doesn't support chunking. Consider using @rpldy/uploady instead");

export default ChunkedUploady;

