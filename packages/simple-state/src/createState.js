// @flow
import { isPlainObject, clone, getMerge } from "@rpldy/shared";
import type { SimpleState } from "./types";

const mergeWithSymbols = getMerge({ withSymbols: true });

const PROXY_SYM = Symbol.for("__rpldy-sstt-proxy__"),
	STATE_SYM = Symbol.for("__rpldy-sstt-state__");

const isProd = process.env.NODE_ENV === "production";

const isProxy = (obj: Object) =>
	!isProd &&
	!!~Object.getOwnPropertySymbols(obj).indexOf(PROXY_SYM);

const getIsUpdateable = (proxy: Object) =>
	isProd ? true : proxy[STATE_SYM].isUpdateable;

const setIsUpdateable = (proxy: Object, value) => {
	if (!isProd) {
		proxy[STATE_SYM].isUpdateable = value;
	}
};

const deepProxy = (obj, traps) => {
	let proxy;

	if (Array.isArray(obj) || isPlainObject(obj)) {
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

const deepUnWrap = (proxy: Object) => {
	delete proxy[PROXY_SYM];

	Object.keys(proxy)
		.concat(Object.getOwnPropertySymbols(proxy)
			.filter((sym) => sym !== STATE_SYM))
		.forEach((key) => {
            proxy[key] = proxy[key] && (proxy[key][PROXY_SYM] || proxy[key]);
		});

	return proxy;
};

const unwrapEntry = (proxy: Object) =>
	isProxy(proxy) ? clone(proxy, mergeWithSymbols) : proxy;

const unwrapState = (proxy: Object) => {
	delete proxy[STATE_SYM];
	return proxy[PROXY_SYM];
};

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
			return key === PROXY_SYM ? deepUnWrap(obj) : obj[key];
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

	if (!isProd && !isProxy(obj)) {
		Object.defineProperty(obj, STATE_SYM, {
			value: { isUpdateable: false },
			configurable: true,
		});
	}

	const proxy = !isProd ? deepProxy(obj, traps) : obj;

	const update = (fn) => {
		if (!isProd && getIsUpdateable(proxy)) {
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
			unwrapEntry(entry) :
			//unwrap entire proxy state
			(isProxy(proxy) ? unwrapState(proxy) : proxy);

	return {
		state: proxy,
		update,
		unwrap,
	};
};

export {
	isProxy,
	unwrapEntry as unwrap
};
