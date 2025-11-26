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
        (fn?: Callback | string, id?: string): any  => {
        const [eventState, setEventState] = useState(null);
        let cbFn = fn;
        let usedId = id;

        if (fn && !isFunction(fn)) {
            usedId = fn;
            cbFn = undefined;
        }

        const eventCallback = useCallback((eventObj: Object, ...args: mixed[]) => {
            if (!usedId || eventObj.id === usedId) {
                setEventState(stateCalculator(eventObj, ...args));

                if (isFunction(cbFn)) {
                    cbFn(eventObj, ...args);
                }
            }
        }, [cbFn, usedId]);

        useEventEffect(event, eventCallback);

        return eventState;
    };

const generateUploaderEventHook = (event: string, canScope: boolean = true): ((fn: Callback, id?: string) => void) =>
    (fn: ?Callback, id?: string) => {
        const eventCallback = useCallback((eventObj: Object, ...args: mixed[]) => {
            return (fn && (!canScope || !id || eventObj.id === id)) ?
                fn(eventObj, ...args) : undefined;
        }, [fn, id]);

        useEventEffect(event, eventCallback);
    };

export {
    generateUploaderEventHook,
    generateUploaderEventHookWithState,
};
