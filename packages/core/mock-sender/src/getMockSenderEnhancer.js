// @flow
import type { UploaderEnhancer, UploaderType, UploaderCreateOptions } from "@rpldy/uploader";
import createMockSender from "./mockSender";
import type { MockOptions } from "./types";

/**
 * an uploader enhancer function to set mock sender instead of current sender
 */
const getMockSenderEnhancer = (options?: MockOptions): UploaderEnhancer<UploaderCreateOptions> =>
    (uploader: UploaderType<UploaderCreateOptions>): UploaderType<UploaderCreateOptions> => {
        const mockSender = createMockSender(options);
        uploader.update({ send: mockSender.send });
        return uploader;
    };

export default getMockSenderEnhancer;
