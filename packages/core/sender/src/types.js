// @flow
import type {
    BatchItem,
    UploadData,
    FormatParamGroupNameMethod,
    FormatServerResponseMethod,
} from "@rpldy/shared";

export type SendOptions = {
    method: string,
    paramName: string,
    params: Object,
    headers?: Object,
    forceJsonResponse: ?boolean,
    withCredentials: ?boolean,
    formatGroupParamName: ?FormatParamGroupNameMethod,
    sendWithFormData?: boolean,
    formatServerResponse?: FormatServerResponseMethod,
};

export type SenderProgressEvent = { total: number, loaded: number };

export type OnProgress = (e: SenderProgressEvent, Object[]) => void;

export type XhrSendConfig = {
    preRequestHandler: (
        issueRequest: (
            requestUrl?: string, requestData?: any, requestOptions?: Object) => Promise<XMLHttpRequest>,
        items: BatchItem[], url: string, options: SendOptions, onProgress: ?OnProgress, config: ?XhrSendConfig) => Promise<XMLHttpRequest>,
    getRequestData: (items: BatchItem[], options: SendOptions) => any,
};

export type SendResult = {
    request: Promise<UploadData>,
    abort: () => boolean,
    senderType: string,
};

export type SendMethod<-T: SendOptions> = (item: BatchItem[], url: ?string, options: T, onProgress: OnProgress) => SendResult;
