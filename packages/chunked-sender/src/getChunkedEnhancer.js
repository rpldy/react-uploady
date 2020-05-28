// @flow
import createChunkedSender from "./chunkedSender";

import type { UploaderType } from "@rpldy/uploader";
import type { ChunkedOptions } from "./types";

export default (options: ChunkedOptions) => {
    const sender = createChunkedSender(options);

    //return uploader enhancer
    return (uploader: UploaderType): UploaderType => {
        uploader.update({ send: sender.send });
        return uploader;
    };
};
