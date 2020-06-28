import * as React from "react";
import { CreateOptions } from "@rpldy/uploader";
import { EventCallback } from "@rpldy/life-events";
import { PreSendData }  from "@rpldy/shared-ui";
import { BatchItem } from "~/shared";

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

export interface WithRequestPreSendUpdateProps {
    id: string;
}

export interface WithRequestPreSendUpdateWrappedProps { //extends WithRequestPreSendUpdateProps {
    id: string;
    updateRequest: (data?: boolean | { items?: BatchItem[]; options?: CreateOptions }) => void;
    requestData: PreSendData;
}

export const withRequestPreSendUpdate: <P extends WithRequestPreSendUpdateProps>(Comp: React.FC<P> | React.ComponentType<P>) =>
    React.FC<Omit<P, "updateRequest" | "requestData">>;

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
