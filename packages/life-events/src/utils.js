// @flow

const isFunction = (f: any) => typeof (f) === "function";

const validateFunction = (f: any, name: string) => {
	if (!isFunction(f)) {
		throw new Error(`${name} is not a valid function`);
	}
};

const isUndefined = (val: any) => typeof (val) === "undefined";

export {
	isFunction,
	validateFunction,
	isUndefined,
}