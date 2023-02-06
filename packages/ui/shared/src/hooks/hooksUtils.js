// @flow
import { useState, useCallback, useEffect } from "react";
import { isFunction } from "@rpldy/shared";
import useUploadyContext from "./useUploadyContext";

import type { WithStateFn, Callback } from "../types";

const useEventEffect = (event: string, fn: Callback) => {
    const context = useUploadyContext();
    const { on, off } = context;

    useEffect(() => {
        on(event, fn);

        return () => {
            off(event, fn);
        };
    }, [event, fn, on, off]);
};

const generateUploaderEventHookWithState =
    <T>(event: string, stateCalculator: (state: T) => any): WithStateFn<T> =>
        (fn? : Callback | string, id?: string): any  => {
        const [eventState, setEventState] = useState(null);

        if (fn && !isFunction(fn)) {
            id = fn;
            fn = undefined;
        }

        const eventCallback = useCallback((eventObj, ...args) => {
            if (!id || eventObj.id === id) {
                setEventState(stateCalculator(eventObj, ...args));

                if (isFunction(fn)) {
                    fn(eventObj, ...args);
                }
            }
        }, [fn, id]);

        useEventEffect(event, eventCallback);

        return eventState;
    };

const generateUploaderEventHook = (event: string, canScope: boolean = true): ((fn: Callback, id?: string) => void) =>
    (fn: Callback, id?: string) => {
        const eventCallback = useCallback((eventObj, ...args) => {
            return (fn && (!canScope || !id || eventObj.id === id)) ?
                fn(eventObj, ...args) : undefined;
        }, [fn, id]);

        useEventEffect(event, eventCallback);
    };

export {
    generateUploaderEventHook,
    generateUploaderEventHookWithState,
};
