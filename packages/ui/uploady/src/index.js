// @flow
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import {
	UploadyContext,

	useBatchStartListener,
	useBatchFinishListener,
	useBatchCancelledListener,
	useBatchAbortListener,

	useFileStartListener,
	useFileFinishListener,
	useFileProgressListener,
	useFileCancelListener,
	useFileErrorListener,
} from "@rpldy/shared-ui";

import Uploady from "./Uploady";

import type { UploadyContextType } from "@rpldy/shared-ui";
import type { UploadyProps } from "./types";

export default Uploady;

export type {
	UploadyContextType,
	UploadyProps,
};

export {
	UploadyContext,
	UPLOADER_EVENTS,

	useBatchStartListener,
	useBatchFinishListener,
	useBatchCancelledListener,
	useBatchAbortListener,

	useFileStartListener,
	useFileFinishListener,
	useFileProgressListener,
	useFileCancelListener,
	useFileErrorListener,
};
