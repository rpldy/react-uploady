// @flow
import UploadyContext, { createContextApi } from "./src/UploadyContext";

import {
	useBatchStartListeneer,
	useBatchFinishListener,
	useBatchCancelledListener,

	useFileStartListener,
	useFileFinishListener,
	useFileProgressListener,
	useFileCancelListener,
	useFileErrorListener,
} from "./src/eventListenerHooks";

import assertContext from "./src/assertContext";

import type { UploadyContextType } from "./types";

export type {
	UploadyContextType,
};

export {
	UploadyContext,
	createContextApi,

	assertContext,

	useBatchStartListeneer,
	useBatchFinishListener,
	useBatchCancelledListener,

	useFileStartListener,
	useFileFinishListener,
	useFileProgressListener,
	useFileCancelListener,
	useFileErrorListener,
};