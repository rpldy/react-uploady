// @flow
import { DEBUG_LOG_KEY } from "./consts";

let isDebug;

const isDebugOn = () => {
	if (typeof isDebug !== "boolean"){
		isDebug = process.env.DEBUG ||
			~window.location.search.indexOf("debug=true") ||
			window[DEBUG_LOG_KEY] === true;
	}

	return isDebug;
};

const setDebug = (debugOn: boolean) => {
	window[DEBUG_LOG_KEY] = debugOn;
	isDebug = null;
};

const debugLog = (...args: any[]) => {
	if (isDebugOn()) {
		// eslint-disable-next-line no-console
		console.log(...args);
	}
};

export {
	isDebugOn,
	setDebug,
	debugLog,
};