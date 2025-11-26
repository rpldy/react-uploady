// @flow
import { abortAll, abortBatch, abortItem } from "./abort";
import type { UploaderEnhancer, UploaderType } from "@rpldy/raw-uploader";

const getAbortEnhancer = <T>(): UploaderEnhancer<T> => {
    /**
     * an uploader enhancer function to add abort functionality
     */
    return (uploader: UploaderType<T>): UploaderType<T> => {
        //$FlowIssue[incompatible-call]: unsure how to tell Flow this is ok...
        uploader.update(({ abortAll, abortBatch, abortItem }: any));
        return uploader;
    };
};

export default getAbortEnhancer;
