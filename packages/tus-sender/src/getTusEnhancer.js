// @flow
import createTusSender from "./tusSender";

import type { UploaderType } from "@rpldy/uploader";
import type { TusOptions } from "./types";

export default (options: TusOptions) => {
    //return uploader enhancer
    return (uploader: UploaderType): UploaderType => {
        const sender = createTusSender(uploader, options);
        uploader.update({ send: sender.send });
        return uploader;
    };
};
