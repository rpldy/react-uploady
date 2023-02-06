// @flow
import { hasWindow } from "@rpldy/shared";
import type { SafeStorage } from "./types";

const safeStorageCreator = (storageType: string): SafeStorage => {
    let isSupported = false;

    const checkSupport = () => {
        try {
            if (hasWindow() && storageType in window) {
                const key = "__lsTest";
                window[storageType].setItem(key, `__test-${Date.now()}`);
                window[storageType].removeItem(key);
                isSupported = true;
            }
        }
        catch(ex){
            //fail silently
        }
    };

    checkSupport();

    const methods = ["key", "getItem", "setItem", "removeItem", "clear"];

    const safeStorage = methods.reduce((res, method) => {
        // $FlowExpectedError[prop-missing]
        res[method] = (...args: mixed[]) =>
            isSupported ? window[storageType][method](...args) : undefined;

        return res;
    }, {});

    // $FlowExpectedError[prop-missing]
    safeStorage.isSupported = isSupported;

    // $FlowExpectedError[prop-missing]
    Object.defineProperty(safeStorage, "length", {
        get(){
            return isSupported ? window[storageType].length : 0;
        }
    });

    // $FlowExpectedError[prop-missing]
    return safeStorage;
};

export default safeStorageCreator;
