// @flow
import createSafeStorage from "./safeStorageCreator";
import type { SafeStorage } from "./types";

const safeLocalStorage = createSafeStorage("localStorage") as SafeStorage;
const safeSessionStorage = createSafeStorage("sessionStorage") as SafeStorage;

export {
    safeLocalStorage,
    safeSessionStorage,
};

