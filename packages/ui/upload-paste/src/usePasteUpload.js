// @flow
import { useEffect, useRef, useCallback } from "react";
import usePasteHandler from "./usePasteHandler";

import type { UploadOptions } from "@rpldy/shared";
import type { PasteUploadHandler, PasteUploadHookResult, PasteElementRef } from "./types";

const registerHandler = (element, handler) => {
    const target = element?.current || window;
    target.addEventListener("paste", handler);
};

const unregisterHandler = (element, handler) => {
    const target = element?.current || window;
    target.removeEventListener("paste", handler);
};

const usePasteUpload = (uploadOptions: UploadOptions, element?: PasteElementRef, onPasteUpload: PasteUploadHandler): PasteUploadHookResult => {
    const enabledRef = useRef(true);

    const onPaste = usePasteHandler(uploadOptions, onPasteUpload);

    const toggle = useCallback(() => {
        enabledRef.current = !enabledRef.current;

        if (enabledRef.current) {
            registerHandler(element, onPaste);
        } else {
            unregisterHandler(element, onPaste);
        }

        return enabledRef.current;
    }, [element, onPaste]);

    const getIsEnabled = useCallback(() => enabledRef.current, []);

    useEffect(() => {
        if (enabledRef.current) {
            registerHandler(element, onPaste);
        }

        return () => {
            if (enabledRef.current) {
                unregisterHandler(element, onPaste);
            }
        };
    }, [element, onPaste]);

    return { toggle, getIsEnabled };
};

export default usePasteUpload;
