// @flow
import type { UploadyProps } from "@rpldy/shared-ui";
import type { TusOptions, ResumeStartEventData } from "@rpldy/tus-sender";

export type TusUploadyProps = {|
	...UploadyProps,
	...$Exact<TusOptions>,
|};

export type ResumeStartEventResponse = void | boolean | {
    url?: string,
    resumeHeaders?: Object,
};

export type TusResumeStartListenerHook = (cb: (data: ResumeStartEventData ) => ResumeStartEventResponse) => void;
