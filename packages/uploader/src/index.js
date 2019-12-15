// @flow
import uploader from "./uploader";
import { UPLOADER_EVENTS } from "./consts";
import { DEFAULT_OPTIONS } from "./defaults";
import type {
	UploaderType,
	UploaderEnhancer,
} from "./types";

export default uploader;

export type {
	UploaderType,
	UploaderEnhancer,
};

export {
	UPLOADER_EVENTS,
	DEFAULT_OPTIONS,
};