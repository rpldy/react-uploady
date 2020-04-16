// @flow
import chunkedSender from "./chunkedSender";

import type { UploaderType } from "@rpldy/uploader";
import type { ChunkedOptions } from "./types";

export default (options: ChunkedOptions) => {
    const chunkedSend = chunkedSender(options);

    //return uploader enhancer
    return (uploader: UploaderType): UploaderType => {
        uploader.update({ send: chunkedSend });
        return uploader;
    };
};
