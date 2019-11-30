// @flow
import uploader from "./src/uploader";
import { UPLOADER_EVENTS } from "./src/consts";
import type { BatchItem } from "./types";

export default uploader;

export type {
	BatchItem,
};

export {
	UPLOADER_EVENTS,
};