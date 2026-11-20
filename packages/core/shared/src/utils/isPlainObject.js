// @flow
const isPlainObject = (obj: Object): boolean => {
    const proto: any = Object.getPrototypeOf(Object(obj));

    return !!obj &&
        typeof obj === "object" &&
        (proto?.constructor.name === "Object" || !proto) &&
        //$FlowExpectedError[invalid-this-arg]
        !Object.prototype.hasOwnProperty.call(obj, "__proto__");
};

export default isPlainObject;
