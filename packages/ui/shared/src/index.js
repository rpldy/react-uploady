// @flow
import UploadyContext, { createContextApi } from "./UploadyContext";
import useWithForwardRef from "./useWithForwardRef";
import assertContext from "./assertContext";
import useUploadOptions from "./useUploadOptions";
import useAbortItem from "./useAbortItem";
import useAbortBatch from "./useAbortBatch";
import useAbortAll from "./useAbortAll";

export {
    useBatchAddListener,
    useBatchStartListener,
    useBatchProgressListener,
    useBatchFinishListener,
    useBatchCancelledListener,
    useBatchAbortListener,

    useItemStartListener,
    useItemFinishListener,
    useItemProgressListener,
    useItemCancelListener,
    useItemErrorListener,
    useItemAbortListener,
    useItemFinalizeListener,

    useRequestPreSend,
} from "./eventListenerHooks";

export {
    generateUploaderEventHook,
    generateUploaderEventHookWithState,
    logWarning,
} from "./utils";

export {
    UploadyContext,
    createContextApi,
    useUploadOptions,
    assertContext,

    useWithForwardRef,

	useAbortAll,
	useAbortBatch,
	useAbortItem,
};

export type {
    InputRef,
    UploadyContextType,
	RefObject,
} from "./types";

