// @flow
import { useEffect, useRef, useCallback, useLayoutEffect } from "react";
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
    const onPasteRef = useRef(onPaste);
    const elementRef = useRef(element);

    useLayoutEffect(() => {
        onPasteRef.current = onPaste;
        elementRef.current = element;
    }, [onPaste, element]);

    const toggle = useCallback(() => {
        const refElm = elementRef.current?.current;
        enabledRef.current = !enabledRef.current;

        if (enabledRef.current) {
            registerHandler(refElm, onPasteRef.current);
        } else {
            unregisterHandler(refElm, onPasteRef.current);
        }

        return enabledRef.current;
    }, []);

    const getIsEnabled = useCallback(() => enabledRef.current, []);

    useEffect(() => {
        const refElm = elementRef.current?.current;

        if (enabledRef.current) {
            registerHandler(refElm, onPasteRef.current);
        }

        return () => {
            if (enabledRef.current) {
                unregisterHandler(refElm, onPasteRef.current);
            }
        };
    }, []);

    return { toggle, getIsEnabled };
};

export default usePasteUpload;
