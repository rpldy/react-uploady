// @flow
import { useCallback, useRef } from "react";
import { useUploady } from "@rpldy/shared-ui";

import type { UploadOptions } from "@rpldy/shared";
import type { PasteUploadHandler } from "./types";

const usePasteHandler = (uploadOptions: ?UploadOptions, onPasteUpload: ?PasteUploadHandler) => {
    const { upload } = useUploady();

    //using ref so paste callback can stay memoized
    const uploadOptionsRef = useRef<?UploadOptions>();
    uploadOptionsRef.current = uploadOptions;

    return useCallback((e) => {
        const count = e.clipboardData?.files?.length;

        if (count) {
            upload(e.clipboardData.files, uploadOptionsRef.current);
            onPasteUpload?.({ count });
        }
    }, [upload, uploadOptionsRef, onPasteUpload]);
};

export default usePasteHandler;
