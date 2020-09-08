// @flow
import createUploader from "./uploader";
import composeEnhancers from "./composeEnhancers";
import { UPLOADER_EVENTS } from "./consts";
import { DEFAULT_OPTIONS } from "./defaults";

export default createUploader;

export {
    UPLOADER_EVENTS,
    DEFAULT_OPTIONS,

    composeEnhancers,
    createUploader,
};

export * from "@rpldy/sender";

export type {
    TriggerMethod
} from "@rpldy/life-events";

export type {
    UploaderType,
    UploaderEnhancer,
    CreateOptions,
} from "./types";
