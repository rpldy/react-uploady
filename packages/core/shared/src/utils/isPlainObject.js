// @flow

export default (obj: mixed): boolean => !!obj &&
    typeof obj === "object" &&
    (Object.getPrototypeOf(obj)?.constructor.name === "Object" ||
        Object.getPrototypeOf(obj) === null);
