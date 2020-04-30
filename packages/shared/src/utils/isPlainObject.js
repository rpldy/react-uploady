export default (obj) => !!obj &&
    typeof obj === "object" &&
    (Object.getPrototypeOf(obj)?.constructor.name === "Object" ||
        Object.getPrototypeOf(obj) === null);
