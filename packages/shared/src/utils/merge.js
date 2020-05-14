// @flow
import isPlainObject from "./isPlainObject";

export type MergeOptions = {
    undefinedOverwrites?: boolean,
};

const getMerge = (options: MergeOptions = {}) => {
   const merge = (target: Object, ...sources: Object[]) => {
        if (target && sources.length) {
            sources.forEach((source) => {
                if (source) {
                    Object.keys(source)
                        .forEach((key) => {
                            const prop = source[key];

                            if (typeof prop !== "undefined" || options.undefinedOverwrites) {
                                if (isPlainObject(prop)) {
                                    //object - go deeper
                                    if (!target[key] || !isPlainObject(target[key])) {
                                        //recreate target prop if doesnt exist or not an object
                                        target[key] = {};
                                    }
                                    merge(target[key], prop);
                                } else {
                                    target[key] = prop;
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
 * Does deep merge of simple objects (only)
 *
 * The first parameter is the target
 * Will only merge objects passed as arguments to this method
 * Any property in a later object will simply override the one in a previous one
 * Undefined properties from sources will be ignored
 *
 * No recursion protection
 */
export default getMerge();

export {
    getMerge,
};
