import { BatchItem, FormatParamGroupNameMethod, UploadData } from "@rpldy/shared";

export type SendResult = {
    request: Promise<UploadData>;
    abort: () => boolean;
};

export type SenderProgressEvent = {
    total: number;
    loaded: number;
};

export type OnProgress = (e: SenderProgressEvent, objs: object[]) => void;

export type SendOptions = {
    method: string;
    paramName: string;
    params?: object;
    headers?: object;
    forceJsonResponse?: boolean;
    withCredentials?: boolean;
    formatGroupParamName?: FormatParamGroupNameMethod;
};

export type SendMethod = (item: BatchItem[], url: string, options: SendOptions, onProgress?: OnProgress) => SendResult;

export const send: SendMethod;

export interface MockOptions {
    delay?: number;
    fileSize?: number;
    progressIntervals?: number[];
    response?: any;
}

export type MockSender = {
    update: (updated: MockOptions) => void;
    send: SendMethod;
};

export const createMockSender: (option: MockOptions) => MockSender;

export default send;
