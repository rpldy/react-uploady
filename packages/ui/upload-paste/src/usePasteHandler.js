// @flow
import { useCallback, useRef } from "react";
import { useUploady } from "@rpldy/shared-ui";

import type { UploadOptions } from "@rpldy/shared";
import type { PasteUploadHandler } from "./types";

const usePasteHandler = (uploadOptions: ?UploadOptions, onPasteUpload: ?PasteUploadHandler): ClipboardEventListener => {
    const { upload } = useUploady();

    //using ref so paste callback can stay memoized
    const uploadOptionsRef = useRef<?UploadOptions>();
    uploadOptionsRef.current = uploadOptions;

    return useCallback((e) => {
        const files = e.clipboardData?.files;

        if (files?.length) {
            upload(files, uploadOptionsRef.current);
            onPasteUpload?.({ count: files.length });
        }
    }, [upload, uploadOptionsRef, onPasteUpload]);
};

export default usePasteHandler;
