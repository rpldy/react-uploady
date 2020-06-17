// @flow
import { isPlainObject } from "@rpldy/shared";
import type { Updateable } from "./types";

const UPD_SYM = Symbol.for("__rpldy-updateable__");

const deepProxy = (obj, traps) => {
	let proxy;

	if (Array.isArray(obj) || isPlainObject(obj)) {
		proxy = new Proxy(obj, traps);

		if (!obj[UPD_SYM]) {
			Object.defineProperty(proxy, UPD_SYM, {
				// get: () => true,
				value: true,
				configurable: true,
			});
		}

		Object.keys(obj)
			.forEach((key) => {
				obj[key] = deepProxy(obj[key], traps);
			});
	}

	return proxy || obj;
};

const deepUnWrap = (proxy: Object) => {
	delete proxy[UPD_SYM];

	Object.keys(proxy)
		.forEach((key) => {
			proxy[key] = proxy[key][UPD_SYM] || proxy[key];
		});

	return proxy;
};

const startUnwrap = (proxy: Object) => proxy[UPD_SYM] || proxy;

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
 * @param obj
 * @returns {{update: update, state: *}}
 */
export default <T>(obj: Object): Updateable<T> => {
	let isUpdateable = false;

	const traps = {
		set: (obj, key, value) => {
			if (isUpdateable) {
				obj[key] = deepProxy(value, traps);
			}

			return true;
		},

		get: (obj, key) => {
			return key === UPD_SYM ? deepUnWrap(obj) : obj[key];
		},

		defineProperty: (obj, key, props) => {
			if (key === UPD_SYM) {
				Object.defineProperty(obj, key, props);
			} else {
				throw new Error("Update state doesnt support defining property");
			}

			return true;
		},

		setPrototypeOf: () => {
			throw new Error("Update state doesnt support setting prototype");
		},

		deleteProperty: (target, key) => {
			if (isUpdateable) {
				delete target[key];
			}

			return true;
		},
	};

	const proxy = process.env.NODE_ENV !== "production" ? deepProxy(obj, traps) : obj;

	const update = (fn) => {
		if (isUpdateable) {
			throw new Error("Can't call update on Updateable already being updated!");
		}

		try {
			isUpdateable = true;
			fn(proxy);
		} finally {
			isUpdateable = false;
		}

		return proxy;
	};

	const unwrap = (entry?: Object) => startUnwrap(entry || proxy);

	return {
		state: proxy,
		update,
		unwrap,
	};
};

export {
	startUnwrap as unwrap
};