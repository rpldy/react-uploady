import {
    BatchItem,
    UploadData,
    SendOptions
} from "@rpldy/shared";

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

/**

 * @param {string} [url] - Some senders may not require a URL. Internal Uploady senders do require it and will throw if not provided
 */
export type SendMethod = (item: BatchItem[], url: string | undefined, options: SendOptions, onProgress?: OnProgress) => SendResult;

export const getXhrSend: (config?: XhrSendConfig) => SendMethod;

export const send: SendMethod;

export default send;

export {
    SendOptions,
};
