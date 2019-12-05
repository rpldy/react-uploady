// @flow
import uploader from "./src/uploader";
import { UPLOADER_EVENTS } from "./src/consts";
import { DEFAULT_OPTIONS} from "./src/defaults";
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