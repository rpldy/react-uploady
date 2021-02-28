// @flow
import { devFreeze } from "@rpldy/shared";

export const DEFAULT_PARAM_NAME = "file";

export const DEFAULT_FILTER = (): boolean => true;

export const DEFAULT_OPTIONS: any = devFreeze({
    autoUpload: true,
    clearPendingOnAdd: false,
    inputFieldName: "file",
    concurrent: false,
    maxConcurrent: 2,
    grouped: false,
    maxGroupSize: 5,
    method: "POST",
    params: {},
    fileFilter: DEFAULT_FILTER,
    forceJsonResponse: false,
    withCredentials: false,
    destination: {},
    send: null,
    sendWithFormData: true,
});
