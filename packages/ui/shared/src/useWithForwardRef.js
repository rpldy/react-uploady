// @flow
import { useRef, useCallback } from "react";
import { isFunction } from "@rpldy/shared";


type ReturnType<T> = { ref: {current: ?T}, setRef: (T) => void };

/**
 * can be used to support forward ref that can be either a function or an object (useRef, createRef)
 * @param ref {Object | Function}
 */
const useWithForwardRef = <T>(ref: Object | (T) => { current: T }): ReturnType<T> => {
    const internalRef = useRef<?T>(null);

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
