// @flow
import createTusSender from "./tusSender";
import { TUS_EXT } from "./consts";

import type { UploaderType, UploaderEnhancer, UploaderCreateOptions } from "@rpldy/uploader";
import type { TriggerMethod } from "@rpldy/life-events";
import type { TusOptions } from "./types";

const getTusEnhancer = (options?: TusOptions): UploaderEnhancer<UploaderCreateOptions> => {
    //return uploader enhancer
    return (uploader: UploaderType<UploaderCreateOptions>, trigger: TriggerMethod): UploaderType<UploaderCreateOptions> => {
        const sender = createTusSender(uploader, options, trigger);
        uploader.update({ send: sender.send });

        uploader.registerExtension(TUS_EXT, {
            getOptions: sender.getOptions,
        });

        return uploader;
    };
};

export default getTusEnhancer;
