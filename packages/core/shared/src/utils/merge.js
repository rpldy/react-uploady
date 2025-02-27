// @flow
import isPlainObject from "./isPlainObject";

export type MergeOptions = {
    undefinedOverwrites?: boolean,
	withSymbols?: boolean,
    predicate?: (mixed, mixed) => boolean,
};

type MergeMethod = (target: Object, ...sources: Array<Object>) => Object;

export const isMergeObj = (obj: Object): boolean => isPlainObject(obj) || Array.isArray(obj);

const getKeys = (obj: Object, options: MergeOptions) => {
	const keys = Object.keys(obj).filter((k) => obj.hasOwnProperty(k) && k !== "__proto__");
	return options.withSymbols ?
		keys.concat(Object.getOwnPropertySymbols(obj)) :
		keys;
};

const getMerge = (options: MergeOptions = {}): MergeMethod => {
   const merge: (...params: Object[]) => Object = (target: Object, ...sources: Object[]) => {
       if (target && sources.length) {
           sources.forEach((source) => {
               if (source) {
                   getKeys(source, options)
                       .forEach((key) => {
                           const prop = source[key];

                           if (!options.predicate || options.predicate(key, prop)) {
                               if (typeof prop !== "undefined" || options.undefinedOverwrites) {
                                   //object/array - go deeper
                                   if (isMergeObj(prop)) {
                                       if (typeof target[key] === "undefined" || !isPlainObject(target[key])) {
                                           //recreate target prop if doesnt exist or not an object
                                           target[key] = Array.isArray(prop) ? [] : {};
                                       }

                                       merge(target[key], prop);
                                   } else {
                                       target[key] = prop;
                                   }
                               }
                           }
                       });
               }
           });
        }

        return target;
    };

   return merge;
};

/**
 * Does deep merge of simple objects and arrays (only)
 *
 * The first parameter is the target
 * Will only merge objects passed as arguments to this method
 * Any property in a later object will simply override the one in a previous one
 * Undefined properties from sources will be ignored
 *
 * No recursion protection
 */
export default (getMerge(): MergeMethod);

export {
    getMerge,
};
