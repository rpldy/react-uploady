import { SendMethod } from "@rpldy/sender";
import { UploaderEnhancer } from "@rpldy/uploader";
import type { IsSuccessfulCall } from "@rpldy/shared";

export interface MockOptions {
    delay?: number;
    fileSize?: number;
    progressIntervals?: number[];
    response?: any;
    responseStatus?: number;
    isSuccessfulCall?: IsSuccessfulCall;
}

export type MockSender = {
    update: (updated: MockOptions) => void;
    send: SendMethod;
};

export const createMockSender: (option: MockOptions) => MockSender;

export const getMockSenderEnhancer: (options?: MockOptions) => UploaderEnhancer;

export default createMockSender;
