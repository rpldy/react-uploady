// @flow

export default (obj: Object) => {
    return process.env.NODE_ENV === "production" ? obj : Object.freeze(obj);
};
