// @flow
import uploader from "./uploader";
import composeEnhancers from "./composeEnhancers";
import { UPLOADER_EVENTS } from "./consts";
import { DEFAULT_OPTIONS } from "./defaults";

export default uploader;

export type {
    UploaderType,
    UploaderEnhancer,
} from "./types";

export type {
    TriggerMethod
} from "@rpldy/life-events";

export {
    UPLOADER_EVENTS,
    DEFAULT_OPTIONS,

    composeEnhancers,
};
