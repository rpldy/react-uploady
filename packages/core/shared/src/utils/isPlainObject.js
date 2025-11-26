// @flow
const isPlainObject = (obj: Object): boolean => {
    const proto = Object.getPrototypeOf(Object(obj));

    return !!obj &&
        typeof obj === "object" &&
        (proto?.constructor.name === "Object" || !proto) &&
        //$FlowExpectedError[method-unbinding]
        !Object.prototype.hasOwnProperty.call(obj, "__proto__");
};

export default isPlainObject;
