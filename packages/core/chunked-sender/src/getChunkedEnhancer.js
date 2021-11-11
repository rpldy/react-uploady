// @flow
import { logger } from "@rpldy/shared";
import createChunkedSender from "./chunkedSender";

import type { UploaderEnhancer, UploaderType } from "@rpldy/uploader";
import type { ChunkedOptions } from "./types";
import type { TriggerMethod } from "@rpldy/life-events";

const getChunkedEnhancer =  (options: ChunkedOptions): UploaderEnhancer => {
    //return uploader enhancer
    return (uploader: UploaderType, trigger: TriggerMethod): UploaderType => {
        const sender = createChunkedSender(options, trigger);
        logger.debugLog("chunkedSenderEnhancer: Created chunked-sender instance with options: ", options);
        uploader.update({ send: sender.send });
        return uploader;
    };
};

export default getChunkedEnhancer;
