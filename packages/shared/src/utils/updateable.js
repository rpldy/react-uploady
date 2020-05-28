// @flow
import isPlainObject from "./isPlainObject";

const deepProxy = (obj, traps) => {
    let proxy;

    if (Array.isArray(obj) || isPlainObject(obj)) {
        proxy = new Proxy(obj, traps);

        Object.keys(obj)
            .forEach((key) => {
                obj[key] = deepProxy(obj[key], traps);
            });
    }

    return proxy || obj;
};

type Updateable<T> = {
    state: T,
    update: ((T) => void) => T,
}

/**
 * deep proxies an object so it is only updateable through an update callback.
 * outside an updater, it is impossible to make changes
 *
 * This a very (very) basic and naive replacement for Immer
 *
 * It doesnt create new references and doesnt copy over anything
 *
 * Original object is changed!
 *
 * @param obj
 * @returns {{update: update, state: *}}
 */
const getUpdateable = <T>(obj: Object): Updateable<T> => {
    let isUpdateable = false;

    const traps = {
        set: (obj, key, value) => {
            if (isUpdateable) {
                obj[key] = value;
            }

            return true;
        },

        defineProperty: () => {
            throw new Error("Update state doesnt support defining property");
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

    const proxy : T = deepProxy(obj, traps);

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

    return {
        state: proxy,
        update,
    };
};

export default getUpdateable;
