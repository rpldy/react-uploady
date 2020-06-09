// @flow
import createChunkedSender from "./chunkedSender";

import type { UploaderType } from "@rpldy/uploader";
import type { ChunkedOptions } from "./types";
import type { TriggerMethod } from "@rpldy/life-events";

export default (options: ChunkedOptions) => {
    //return uploader enhancer
    return (uploader: UploaderType, trigger: TriggerMethod): UploaderType => {
		const sender = createChunkedSender(options, trigger);
        uploader.update({ send: sender.send });
        return uploader;
    };
};
