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

const generateUploaderEventHookWithState = (event: string, stateCalculator: (state: any) => any) =>
	(fn?: Callback, id?: string) => {
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

const generateUploaderEventHook = (event: string) =>
	(fn: Callback, id?: string) => {
		const eventCallback = useCallback((eventObj, ...args) => {
			if (fn && (!id || eventObj.id === id)) {
				fn(eventObj, ...args);
			}
		}, [fn, id]);

		useEventEffect(event, eventCallback);
	};

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
