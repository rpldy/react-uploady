// @flow
import { abortAll, abortBatch, abortItem } from "./abort";
import type { UploaderType } from "@rpldy/uploader";
// import type { UploaderEnhancer } from "@rpldy/shared";
// import type { TriggerMethod } from "@rpldy/life-events";


//TODO: CREATE uploader-base package with UploaderEnhancer & CreateOptions types

const getAbortEnhancer = () => {
    /**
     * an uploader enhancer function to add abort functionality
     */
    return (uploader: UploaderType): UploaderType => {

        uploader.update({ abortAll, abortBatch, abortItem });
        //     uploader.registerExtension(ABORT_EXT, {
        //     abortAll,
        //     abortBatch,
        //     abortItem,
        // });

        return uploader;
    };
};

export default getAbortEnhancer;
