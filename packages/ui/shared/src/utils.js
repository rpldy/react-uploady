// @flow
import { useEffect, useState, useCallback } from "react";
import { isProduction } from "@rpldy/shared";
import { UPLOAD_OPTIONS_COMP } from "./consts";
import useUploadyContext from "./useUploadyContext";

type Callback = (...args?: any) => ?any;

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

const generateUploaderEventHookWithState = (event: string, stateCalculator: (state: any) => any): ((fn?: Callback, id?: string) => any ) =>
	(fn?: Callback, id?: string) => {
		const [eventState, setEventState] = useState(null);

		const eventCallback = useCallback((eventObj, ...args) => {
			if (!id || eventObj.id === id) {
				setEventState(stateCalculator(eventObj, ...args));

				if (fn) {
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

const logWarning = (condition: ?any, msg: string) => {

	if (!isProduction() && !condition) {
		// eslint-disable-next-line no-console
		console.warn(msg);
	}
};

const markAsUploadOptionsComponent = (Component: React$ComponentType<any>): void => {
    Component[UPLOAD_OPTIONS_COMP] = true;
};

const getIsUploadOptionsComponent = (Component: any): boolean =>
    Component[UPLOAD_OPTIONS_COMP] === true ||
    Component.target?.[UPLOAD_OPTIONS_COMP] === true ||
    Component.render?.[UPLOAD_OPTIONS_COMP] === true;

export {
	generateUploaderEventHook,
	generateUploaderEventHookWithState,
	logWarning,
    markAsUploadOptionsComponent,
    getIsUploadOptionsComponent,
};
