// @flow
import { devFreeze } from "@rpldy/shared";
import type { MandatoryPreviewOptions } from "./types";

export const PREVIEW_DEFAULTS: MandatoryPreviewOptions = devFreeze({
    rememberPreviousBatches: false,
    loadFirstOnly: false,
    maxPreviewImageSize: 2e+7,
    maxPreviewVideoSize: 1e+8,
    fallbackUrl: "",
    imageMimeTypes: ["image/jpeg", "image/webp", "image/gif", "image/png", "image/apng", "image/bmp", "image/x-icon", "image/svg+xml"],
    videoMimeTypes: ["video/mp4", "video/webm", "video/ogg"],
    previewComponentProps: undefined,
});
