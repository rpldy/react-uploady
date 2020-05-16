// @flow

let isSupported = false;

const checkSupport = () => {
    try {
        if ("localStorage" in window) {
            const key = "__lsTest";
            window.localStorage.setItem(key, `__test-${Date.now()}`);
            window.localStorage.removeItem(key);
            isSupported = true;
        }
    }
    catch(ex){
        //fail silently
    }
};

checkSupport();

const methods = ["key", "getItem", "setItem", "removeItem", "clear"];

const safeLocalStorage = methods.reduce((res, method) => {
    res[method] = (...args: mixed[]) =>
        isSupported ? window.localStorage[method](...args) : null;

    return res;
}, {});

safeLocalStorage.isSupported = isSupported;

Object.defineProperty(safeLocalStorage, "length", {
    get(){
        return isSupported ? window.localStorage.length : 0;
    }
});

export default safeLocalStorage;
