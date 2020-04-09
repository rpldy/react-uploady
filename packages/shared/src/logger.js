// @flow
import { DEBUG_LOG_KEY } from "./consts";

let isDebug;

const isEnvDebug =  () =>
    process.env.NODE_ENV !== "production" && process.env.DEBUG;

const isDebugOn = () => {
	if (typeof isDebug !== "boolean"){
		isDebug = isEnvDebug() ||
			!!~window.location.search.indexOf("rpldy_debug=true") ||
			window[DEBUG_LOG_KEY] === true;
	}

	return isDebug;
};

const setDebug = (debugOn: boolean) => {
	window[DEBUG_LOG_KEY] = debugOn;
	isDebug = debugOn ? true : null;
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
