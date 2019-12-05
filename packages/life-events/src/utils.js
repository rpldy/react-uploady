// @flow
import { utils } from "@rupy/shared";

const validateFunction = (f: any, name: string) => {
	if (!utils.isFunction(f)) {
		throw new Error(`${name} is not a valid function`);
	}
};

const isUndefined = (val: any) => typeof (val) === "undefined";

export {
	validateFunction,
	isUndefined,
}