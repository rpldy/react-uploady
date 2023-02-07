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

    const base = {
        isSupported,
        length: 0,
    };

    const safeStorage = methods.reduce<{ length: number, isSupported: boolean, [string]: (...args: mixed[]) => void }>(
        (res, method) => {
            res[method] = (...args: mixed[]) =>
                isSupported ? window[storageType][method](...args) : undefined;

            return res;
        }, base);

    Object.defineProperty(safeStorage, "length", {
        get(){
            return isSupported ? window[storageType].length : 0;
        }
    });

    return safeStorage;
};

export default safeStorageCreator;
