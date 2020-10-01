// @flow
import { clone, getMerge, isProduction } from "@rpldy/shared";
import { PROXY_SYM, STATE_SYM } from "./consts";
import { isProxiable, isProxy } from "./utils";

import type { SimpleState } from "./types";

const mergeWithSymbols = getMerge({
    withSymbols: true,
    predicate: (key) => key !== PROXY_SYM && key !== STATE_SYM,
});
const getIsUpdateable = (proxy: Object) =>
    isProduction() ? true : proxy[STATE_SYM].isUpdateable;

const setIsUpdateable = (proxy: Object, value) => {
	if (!isProduction()) {
		proxy[STATE_SYM].isUpdateable = value;
	}
};

const deepProxy = (obj, traps) => {
	let proxy;

	if (isProxiable(obj)) {
		if (!isProxy(obj)) {
			obj[PROXY_SYM] = true;
			proxy = new Proxy(obj, traps);
		}

		Object.keys(obj)
			.forEach((key) => {
				obj[key] = deepProxy(obj[key], traps);
			});
	}

	return proxy || obj;
};

const unwrapProxy = (proxy: Object) =>
	isProxy(proxy) ? clone(proxy, mergeWithSymbols) : proxy;

/**
 * deep proxies an object so it is only updateable through an update callback.
 * outside an updater, it is impossible to make changes
 *
 * This a very (very) basic and naive replacement for Immer
 *
 * It only proxies simple objects (not maps or sets) and arrays
 * It doesnt create new references and doesnt copy over anything
 *
 * Original object is changed!
 *
 * DOESNT support updating state (wrapped seperately) that is set as a child of another state
 * @param obj
 * @returns {{state, update, unwrap}}
 */
export default <T>(obj: Object): SimpleState<T> => {
	const traps = {
		set: (obj, key, value) => {
			if (getIsUpdateable(proxy)) {
				obj[key] = deepProxy(value, traps);
			}

			return true;
		},

		get: (obj, key) => {
			return key === PROXY_SYM ? unwrapProxy(obj) : obj[key];
		},

		defineProperty: () => {
			throw new Error("Simple State doesnt support defining property");
		},

		setPrototypeOf: () => {
			throw new Error("Simple State doesnt support setting prototype");
		},

		deleteProperty: (obj, key) => {
			if (getIsUpdateable(proxy)) {
				delete obj[key];
			}

			return true;
		},
	};

	if (!isProduction() && !isProxy(obj)) {
		Object.defineProperty(obj, STATE_SYM, {
			value: { isUpdateable: false },
			configurable: true,
		});
	}

	const proxy = !isProduction() ? deepProxy(obj, traps) : obj;

	const update = (fn) => {
		if (!isProduction() && getIsUpdateable(proxy)) {
			throw new Error("Can't call update on State already being updated!");
		}

		try {
			setIsUpdateable(proxy, true);
            fn(proxy);
        } finally {
            setIsUpdateable(proxy, false);
        }

        return proxy;
	};

	const unwrap = (entry?: Object) => entry ?
			//simply clone the provided object (if its a proxy)
			unwrapProxy(entry) :
			//unwrap entire proxy state
			(isProxy(proxy) ? unwrapProxy(proxy) : proxy);

	return {
		state: proxy,
		update,
		unwrap,
	};
};

export {
	isProxy,
    unwrapProxy as unwrap
};
