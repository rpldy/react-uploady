// @flow
import { DEBUG_LOG_KEY } from "./consts";
import hasWindow from "./utils/hasWindow";
import { isProduction } from "./utils";

let isDebug;

const isEnvDebug =  () =>
    !isProduction() && process?.env?.DEBUG;

const isDebugOn = (): boolean | string => {
	if (typeof isDebug !== "boolean") {
        isDebug = isEnvDebug() ||
            (hasWindow() &&
                (("location" in window && !!~window.location.search.indexOf("rpldy_debug=true")) ||
                    window[DEBUG_LOG_KEY] === true));
    }

	return isDebug;
};

const setDebug = (debugOn: boolean) => {
	if (hasWindow()) {
	    window[DEBUG_LOG_KEY] = debugOn;
    }

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
