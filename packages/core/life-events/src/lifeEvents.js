// @flow
import { isPromise } from "@rpldy/shared";
import defaults from "./defaults";
import { validateFunction, isUndefined } from "./utils";
import { LESYM, LE_PACK_SYM } from "./consts";
import type { Options, LifeEventsAPI, RegItem, EventCallback } from "./types";

//TODO: implement STATS

const getLE = (obj: Object) => obj ? obj[LESYM] : null;

const getValidLE = (obj: Object) => {
	const le = getLE(obj);

	if (!le) {
		throw new Error("Didnt find LE internal object. Something very bad happened!");
	}

	return le;
};

const isLE = (obj: Object): boolean => !!getLE(obj);

const addRegistration = (obj: Object, name: any, cb: Function, once: boolean = false) => {
	validateFunction(cb, "cb");

	const le = getValidLE(obj);

	if (!le.options.allowRegisterNonExistent &&
		!~le.events.indexOf(name)) {
		throw new Error(`Cannot register for event ${name.toString()} that wasn't already defined (allowRegisterNonExistent = false)`);
	}

	const regItem: RegItem = {
		name,
		cb,
		once,
	};

	const namedRegistry = le.registry[name] || [];

	if (!namedRegistry.find((r: RegItem) => r.cb === cb)) { //only add same callback for a name once
		namedRegistry.push(regItem);
		le.registry[name] = namedRegistry;
	}

	return () => unregister.call(obj, name, cb);
};

const findRegistrations = (obj: Object, name?: any): RegItem[] => {
	const registry = getValidLE(obj).registry;

	return name ?
		(registry[name] ? registry[name].slice() : []) :
		Object.values(registry).flat();
};

const publicMethods = {
	"on": register,
	"once": registerOnce,
	"off": unregister,
	"getEvents": getEvents,
};

const getPublicMethods = () =>
    Object.entries(publicMethods)
        .reduce((res, [key, m]) => {
            res[key] = { value: m };
            return res;
        }, ({}: { [string]: any }));

type ApiFn =  (...args: any[]) => any;

//using string keys here because can't rely on function names to stay after (babel/webpack) build
const apiMethods: { [string]: ApiFn }  = {
    "trigger": trigger,
    "addEvent": addEvent,
    "removeEvent": removeEvent,
    "hasEvent": hasEvent,
    "hasEventRegistrations": hasEventRegistrations,
    "assign": assign
};

//placating flow while using reduce to create an object API
type ApiCreated = { target: Object, [string]: ApiFn };

const createApi = (target: Object): LifeEventsAPI =>
    Object.entries(apiMethods)
        .reduce<ApiCreated>
        ((res, [name, fn]) => {
            res[name] = fn.bind(target);
            return res;
        }, { ...apiMethods, target });

const cleanRegistryForName = (obj: Object, name: any, force: boolean = false) => {
	const registry = getValidLE(obj).registry;

	if (registry[name] && (force || !registry[name].length)) {
		delete registry[name];
	}
};

const removeRegItem = (obj: Object, name: any, cb?: Function) => {
	const registry = getValidLE(obj).registry;

	if (registry[name]) {
		if (!cb) {
			cleanRegistryForName(obj, name, true);
		} else {
			registry[name] = registry[name].filter((reg) => reg.cb !== cb);
			cleanRegistryForName(obj, name);
		}
	}
};

function register(this: any, name: any, cb: EventCallback) {
	return addRegistration(this, name, cb);
}

function registerOnce(this: any, name: any, cb: EventCallback) {
	return addRegistration(this, name, cb, true);
}

function unregister(this: any, name: any, cb?: EventCallback) {
	removeRegItem(this, name, cb);
}

function getEvents(this: any) {
	return getValidLE(this).events.slice();
}

function trigger(this: any, name: any, ...args: any[]) {
	const regs = findRegistrations(this, name);
	let results;

    if (regs.length) {
        let packValue;

        if (args.length === 1 && args[0]?.[LE_PACK_SYM] === true) {
            //life-pack always returns array as params to spread
            packValue = args[0].resolve();
        }

        results = regs.map((r: RegItem): any => {
            let result;

            if (r.once) {
                removeRegItem(this, name, r.cb);
			}

			if (packValue) {
                result = r.cb(...packValue);
            } else if (!args.length) {
				result = r.cb();
			} else if (args.length === 1) {
				result = r.cb(args[0]);
			} else if (args.length === 2) {
				result = r.cb(args[0], args[1]);
			} else if (args.length === 3) {
				result = r.cb(args[0], args[1], args[2]);
			} else {
				result = r.cb(...args);
			}

			return result;
		})
			.filter((result: any): any => !isUndefined(result))
			.map((result: any): Promise<any> => isPromise(result) ? result : Promise.resolve(result));
	}

	return results && (results.length ? results : undefined);
}

//registry, events, stats become shared
function assign(this: any, toObj: Object) {
	const le = getValidLE(this);
	defineLifeData(toObj, le.options, le.events, le.registry, le.stats);

	return createApi(toObj);
}

function addEvent(this: any, name: any) {
	const le = getValidLE(this);

	if (le.options.canAddEvents) {
		const index = le.events.indexOf(name);

		if (!~index) {
			le.events.push(name);
		} else {
			throw new Error(`Event '${name}' already defined`);
		}

	} else {
		throw new Error("Cannot add new events (canAddEvents = false)");
	}
}

function removeEvent(this: any, name: any) {
	const le = getValidLE(this);

	if (le.options.canRemoveEvents) {
		const index = le.events.indexOf(name);
		le.events.splice(index, 1);
	} else {
		throw new Error("Cannot remove events (canRemoveEvents = false)");
	}
}

function hasEvent(this: any, name: any) {
	const le = getValidLE(this);
	return !!~le.events.indexOf(name);
}

function hasEventRegistrations(this: any, name: any) {
	return !!findRegistrations(this, name).length;
}

// function getStats(name?: any) {
//
// }

const defineLifeData = (target: Object, options: Options, events: any[] = [], registry: Object = {}, stats: Object = {}) => {
	Object.defineProperties(target, {
        // $FlowFixMe[invalid-computed-prop] - https://github.com/facebook/flow/issues/3258
		[(LESYM: any)]: {
			value: Object.seal({
				registry,
				events,
				options,
				stats,
			}),
		},
		...getPublicMethods(),
	});
};

const addLife = (target?: Object, events: any[] = [], options?: ?Options): LifeEventsAPI => {
	const useTarget = target || {};
	const usedOptions = { ...defaults, ...options };

	if (!isLE(useTarget)) {
		defineLifeData(useTarget, usedOptions, events);
	}

	return createApi(useTarget);
};

export default addLife;

export {
	isLE,
};
