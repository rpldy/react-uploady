import * as React from "react";
import {
    TusOptions,
    TusPartStartEventData,
    TusPartStartEventResponse,
    TusResumeStartEventData,
    TusResumeStartEventResponse
} from "@rpldy/tus-sender";
import { UploadyProps } from "@rpldy/shared-ui";

export * from "@rpldy/uploady";

export interface TusUploadyProps extends UploadyProps, TusOptions {}

export const TusUploady: React.ComponentType<TusUploadyProps>;

export default TusUploady;

export type ClearResumableStore = () => void;

export const useClearResumableStore: () => ClearResumableStore;

export const useTusResumeStartListener: (cb: (data: TusResumeStartEventData) => TusResumeStartEventResponse) => void;

export const useTusPartStartListener: (cb: (data: TusPartStartEventData) => TusPartStartEventResponse) => void;

export {
    TusOptions,
    TusResumeStartEventData,
    TusResumeStartEventResponse,
};
