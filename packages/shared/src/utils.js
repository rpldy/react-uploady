// @flow

const isFunction = (f: mixed): boolean %checks => typeof (f) === "function";

const getPropsExtractor = (prop: string | string[]) => {
	const props = [].concat(prop);

	return (arr: Object[]) =>
		arr.map((i) => props.map((p) => i[p]).join());
};

/*
stringifies props together - will return true for same type of value (ex: function)
even if refs are different
 */
const isSamePropInArrays = (arr1: Object[], arr2: Object[], prop: string | string[]): boolean => {
	let diff = true;
	const propsExtractor = getPropsExtractor(prop);

	if (arr1 && arr2 && arr1.length === arr2.length) {
		const props1 = propsExtractor(arr1),
			props2 = propsExtractor(arr2);

		diff = !!props1.find((p, i) => p !== props2[i]);
	}

	return !diff;
};

// /**
//  * stringifies an object (props) in a way that should lead
//  * to same string as long as keys/values stay the same
//  * while any change will result in a different string
//  * doesnt handle object ref properties - these will result in the same string even if different ref value
//  * only deals with own properties
//  *
//  * This is better than using JSON.stringify because it attempts to sort the properties
//  * however its less accurate due to object properties
//  */
// const getHookDependenciesString = (deps: Object): string => {
//     return Object.keys(deps)
//         .sort()
//         .reduce((res, key) => {
//
//         }, "");
// };

export {
	isFunction,
	isSamePropInArrays,
    // getHookDependenciesString,
};
