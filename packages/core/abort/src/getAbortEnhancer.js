// @flow
import { abortAll, abortBatch, abortItem } from "./abort";
import type { UploaderEnhancer, UploaderType } from "@rpldy/raw-uploader";

const getAbortEnhancer = <T>(): UploaderEnhancer<T> => {
    /**
     * an uploader enhancer function to add abort functionality
     */
    return (uploader: UploaderType<T>): UploaderType<T> => {
        //$FlowIssue[incompatible-call]: no way of telling flow this is ok...
        uploader.update({ abortAll, abortBatch, abortItem });
        return uploader;
    };
};

export default getAbortEnhancer;
