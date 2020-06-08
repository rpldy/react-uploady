// @flow
import { useRef, useCallback } from "react";
import { isFunction } from "@rpldy/shared";

import type { RefObject } from "./types";

type ReturnType<T> = { ref: RefObject<T>, setRef: (T) => mixed };

/**
 * can be used to support forward ref that can be either a function or an object (useRef, createRef)
 * @param ref {Object | Function}
 */
const useWithForwardRef = <T>(ref?: RefObject<T> | (T) => mixed): ReturnType<T> => {
    const internalRef = useRef<T | null | void>(null);

    const setRef = useCallback((elm) => {
            if (ref) {
                if (isFunction(ref)) {
                    ref(elm);
                } else {
                    ref.current = elm;
                }
            }

            internalRef.current = elm;
        },
        [ref]
    );

    return {
        ref: internalRef,
        setRef,
    };
};


export default useWithForwardRef;
