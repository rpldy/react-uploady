// @flow
import uploader from "./src/uploader";
import { UPLOADER_EVENTS } from "./src/consts";
import { DEFAULT_OPTIONS} from "./src/defaults";
import type { UploaderType, UploaderEnhancer, BatchItem } from "./types";

export default uploader;

export type {
	UploaderType,
	UploaderEnhancer,
	BatchItem,
};

export {
	UPLOADER_EVENTS,
	DEFAULT_OPTIONS,
};