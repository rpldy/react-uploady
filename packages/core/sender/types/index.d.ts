import { BatchItem, FormatParamGroupNameMethod, UploadData } from "@rpldy/shared";

export interface SendOptions  {
    method: string;
    paramName: string;
    params?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    forceJsonResponse?: boolean;
    withCredentials?: boolean;
    formatGroupParamName?: FormatParamGroupNameMethod;
}

export interface XhrSendConfig {
    preRequestHandler: (
        issueRequest: (requestUrl?: string, requestData?: unknown, requestOptions?: Record<string, any>) => Promise<XMLHttpRequest>) =>
        Promise<XMLHttpRequest>;
    getRequestData: (items: BatchItem[], options: SendOptions) => unknown
}

export type SendResult = {
    request: Promise<UploadData>;
    abort: () => boolean;
    senderType: string;
};

export type SenderProgressEvent = {
    total: number;
    loaded: number;
};

export type OnProgress = (e: SenderProgressEvent, objs: Record<string, unknown>[]) => void;

export type SendMethod = (item: BatchItem[], url: string, options: SendOptions, onProgress?: OnProgress) => SendResult;

export const getXhrSend: (config?: XhrSendConfig) => SendMethod;

export const send: SendMethod;

export default send;
