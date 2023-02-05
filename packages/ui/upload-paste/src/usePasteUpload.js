// @flow
import { useEffect, useRef, useCallback } from "react";
import usePasteHandler from "./usePasteHandler";

import type { UploadOptions } from "@rpldy/shared";
import type { PasteUploadHandler, PasteUploadHookResult, PasteElementRef } from "./types";

const registerHandler = (refElm: ?Element, handler: ClipboardEventListener) => {
    const target = refElm || window;
    target.addEventListener("paste", handler);
};

const unregisterHandler = (refElm: ?Element, handler: ClipboardEventListener) => {
    const target = refElm || window;
    target.removeEventListener("paste", handler);
};

const usePasteUpload = (uploadOptions: ?UploadOptions, element?: ?PasteElementRef, onPasteUpload?: PasteUploadHandler): PasteUploadHookResult => {
    const enabledRef = useRef(true);

    const onPaste = usePasteHandler(uploadOptions, onPasteUpload);

    const toggle = useCallback(() => {
        const refElm = element?.current;
        enabledRef.current = !enabledRef.current;

        if (enabledRef.current) {
            registerHandler(refElm, onPaste);
        } else {
            unregisterHandler(refElm, onPaste);
        }

        return enabledRef.current;
    }, [element, onPaste]);

    const getIsEnabled = useCallback(() => enabledRef.current, []);

    useEffect(() => {
        const refElm = element?.current;

        if (enabledRef.current) {
            registerHandler(refElm, onPaste);
        }

        return () => {
            if (enabledRef.current) {
                unregisterHandler(refElm, onPaste);
            }
        };
    }, [element, onPaste]);

    return { toggle, getIsEnabled };
};

export default usePasteUpload;
