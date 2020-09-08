import * as React from "react";
import { CreateOptions } from "@rpldy/uploader";
import { PreSendData, UploadyProps }  from "@rpldy/shared-ui";
import { BatchItem } from "~/shared";

export const Uploady: React.ComponentType<UploadyProps>;

export interface WithRequestPreSendUpdateProps {
    id: string;
}

export interface WithRequestPreSendUpdateWrappedProps {
    id: string;
    updateRequest: (data?: boolean | { items?: BatchItem[]; options?: CreateOptions }) => void;
    requestData: PreSendData;
}

export const withRequestPreSendUpdate: <P extends WithRequestPreSendUpdateProps>(Comp: React.FC<P> | React.ComponentType<P>) =>
    React.FC<Omit<P, "updateRequest" | "requestData">>;

export default Uploady;

export {
    UploadyContext,
    NoDomUploady,
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
