// @flow

const getProp = (obj, key) =>
    key !== "__proto__" ? obj[key] : undefined;

const isObjectProp = (prop) =>
    prop && typeof prop === "object" && !Array.isArray(prop);

/**
 * Does deep merge of simple objects (only)
 *
 * The first parameter is the target
 * Will only merge objects passed as arguments to this method
 * Any property in a later object will simply override the one in a previous one
 * Undefined properties will be ignored
 *
 * No recursion protection
 */
const merge = (target: Object, ...args: Object[]) => {
    if (target && args.length) {
        args.forEach((source) => {
            if (source) {
                Object.keys(source)
                    .forEach((key) => {
                        const prop = getProp(source, key);

                        if (typeof prop !== "undefined") {
                            if (isObjectProp(prop)) {
                                //object - go deeper
                                if (!target[key] || !isObjectProp(target[key])) {
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

export default merge;
