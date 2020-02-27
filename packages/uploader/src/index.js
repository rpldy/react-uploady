// @flow
import uploader from "./uploader";
import { UPLOADER_EVENTS } from "./consts";
import { DEFAULT_OPTIONS } from "./defaults";

export default uploader;

export type {
    UploaderType,
    UploaderEnhancer,
} from "./types";

export {
    UPLOADER_EVENTS,
    DEFAULT_OPTIONS,
};
