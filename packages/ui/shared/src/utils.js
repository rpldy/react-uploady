// @flow
import { useEffect, useContext, useState, useCallback } from "react";
import { UploadyContext } from "@rpldy/uploady";
import assertContext from "./assertContext";

type Callback = (...args?: any) => ?any;

const useEventEffect = (event: string, fn: Callback) => {
	const context = assertContext(useContext(UploadyContext));
	const { on, off } = context;

	useEffect(() => {
		on(event, fn);

		return () => {
			off(event, fn);
		};
	}, [event, fn, on, off]);
};

const generateUploaderEventHookWithState = (event: string, stateCalculator: (state: any) => any) => {
	return (fn?: Callback) => {
		const [eventState, setEventState] = useState(null);

		const eventCallback = useCallback((...args) => {
			setEventState(stateCalculator(...args));

			if (fn) {
				fn(...args);
			}
		}, [fn]);

		useEventEffect(event, eventCallback);

		return eventState;
	};
};

const generateUploaderEventHook = (event: string) =>
	(fn: Callback) =>
		useEventEffect(event, fn);

const logWarning = (condition: ?any, msg: string) => {
    if (process.env.NODE_ENV !== "production" && !condition) {
        // eslint-disable-next-line no-console
        console.warn(msg);
    }
};

export {
	generateUploaderEventHook,
	generateUploaderEventHookWithState,
    logWarning,
};
