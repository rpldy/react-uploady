// @flow
import UploadPreview, { getUploadPreviewForBatchItemsMethod } from "./UploadPreview";
import { getPreviewsLoaderHook } from "./usePreviewsLoader";

export {
    PREVIEW_TYPES,
} from "./consts";

export type {
    PreviewProps,
    PreviewItem,
    PreviewMethods,
    RemovePreviewMethod,
    ClearPreviewsMethod,
} from "./types";

export default UploadPreview;

export {
    getUploadPreviewForBatchItemsMethod,
    getPreviewsLoaderHook,
    UploadPreview,
};

