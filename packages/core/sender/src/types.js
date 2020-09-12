// @flow

import type {
    BatchItem,
    UploadData,
    FormatParamGroupNameMethod,
} from "@rpldy/shared";

export type SendResult = {
    request: Promise<UploadData>,
    abort: () => boolean,
    senderType: string,
};

export type SendOptions = {
    method: string,
    paramName: string,
    params: Object,
    headers?: Object,
    forceJsonResponse: ?boolean,
    withCredentials: ?boolean,
    formatGroupParamName: ?FormatParamGroupNameMethod,
    sendWithFormData?: boolean,
};

export type SenderProgressEvent = { total: number, loaded: number };

export type OnProgress = (e: SenderProgressEvent, Object[]) => void;

export type SendMethod<-T: SendOptions> = (item: BatchItem[], url: string, options: T, onProgress: OnProgress) => SendResult;
