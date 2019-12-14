// @flow
import UploadyContext, { createContextApi } from "./src/UploadyContext";

import {
	useBatchStartListener,
	useBatchFinishListener,
	useBatchCancelledListener,

	useFileStartListener,
	useFileFinishListener,
	useFileProgressListener,
	useFileCancelListener,
	useFileErrorListener,
} from "./src/eventListenerHooks";

import assertContext from "./src/assertContext";

import type { UploadyContextType } from "./src/types";

export type {
	UploadyContextType,
};

export {
	UploadyContext,
	createContextApi,

	assertContext,

	useBatchStartListener,
	useBatchFinishListener,
	useBatchCancelledListener,

	useFileStartListener,
	useFileFinishListener,
	useFileProgressListener,
	useFileCancelListener,
	useFileErrorListener,
};