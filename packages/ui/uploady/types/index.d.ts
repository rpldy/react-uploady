import * as React from "react";
import { CreateOptions } from "@rpldy/uploader";
import { EventCallback } from "@rpldy/life-events";

export type UploaderListeners = { [key: string]: EventCallback };

export interface UploadyProps extends CreateOptions {
    debug?: boolean;
    listeners?: UploaderListeners;
    customInput?: boolean;
    inputFieldContainer?: HTMLElement;
    children?: JSX.Element[] | JSX.Element;
    capture?: string;
    multiple?: boolean;
    accept?: string;
    webkitdirectory?: boolean;
    fileInputId?: string;
}

export const Uploady: React.ComponentType<UploadyProps>;

export default Uploady;

export {
    UploadyContext,
    assertContext,
    useUploadOptions,

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

    useAbortAll,
    useAbortBatch,
    useAbortItem,
} from "@rpldy/shared-ui";
