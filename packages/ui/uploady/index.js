// @flow
import { UPLOADER_EVENTS } from "@rupy/uploader";
import {
	UploadyContext,

	useBatchStartListener,
	useBatchFinishListener,
	useBatchCancelledListener,
	useFileStartListener,
	useFileFinishListener,
	useFileProgressListener,
	useFileCancelListener,
	useFileErrorListener,
} from "@rupy/shared-ui";

import Uploady from "./src/Uploady";

import type { UploadyContextType } from "@rupy/shared-ui";

import type { UploadyProps } from "./src/types";

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
	useFileStartListener,
	useFileFinishListener,
	useFileProgressListener,
	useFileCancelListener,
	useFileErrorListener,
};
